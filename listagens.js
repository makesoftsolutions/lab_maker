function sortGrade(str1, str2) {
  const extrairDados = (str) => {
    const match = str.match(/^(seg|ter|qua|qui|sex)\s-\s(\d{2}:\d{2})\s-\s\d{2}:\d{2}$/);
    if (match) {
      return {
        dia: match[1],
        horarioInicio: match[2]
      };
    }
    return null;
  };

  const dados1 = extrairDados(str1);
  const dados2 = extrairDados(str2);

  if (!dados1 || !dados2) {
    return 0;
  }
  if (dados1.dia !== dados2.dia) {
    const dias = ['seg', 'ter', 'qua', 'qui', 'sex'];
    return dias.indexOf(dados1.dia) - dias.indexOf(dados2.dia);
  } else {
    return dados1.horarioInicio.localeCompare(dados2.horarioInicio);
  }
}

function load_students(grade) {
  fetch("http://localhost:3000/api/students")
    .then((response) => response.json())
    .then((data) => {
      const days = [
        "monday-list",
        "tuesday-list",
        "wednesday-list",
        "thursday-list",
        "friday-list",
      ];

      // Adicionei aqui aqui para ordenar os estudantes por dia e horário (funcionando)
      data.sort((a, b) => {
        const dateA = new Date(a.date[0]).getTime();
        const dateB = new Date(b.date[0]).getTime();

        if (dateA === dateB) {
          const gradeIdA = a.gradeReference[0];                   // Se os dias são iguais, ordenar por horário
          const gradeIdB = b.gradeReference[0];
          const timeA = grade.find((gradeItem) => gradeItem._id === gradeIdA).description;
          const timeB = grade.find((gradeItem) => gradeItem._id === gradeIdB).description;

          return timeA.localeCompare(timeB);
        }

        return dateA - dateB;
      });

      data.forEach((student) => {
        const studentReference = new Date(student.date[0]);
        const studentGradeId = student.gradeReference[0];
        const studentGradeDescription = grade.find(
          (gradeItem) => gradeItem._id === studentGradeId
        ).description;

        const week = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; //somando uma semana em ms

        days.forEach((day) => {
          if (
            studentReference.getDay() == days.indexOf(day) &&
            studentReference.getTime() < week
          ) {
            const studentItem = document.createElement("div");
            studentItem.innerHTML = `<div class=\"student-print\"><strong>Nome:</strong> ${student.name}<br> <strong>Horário:</strong> ${studentGradeDescription}</div>`;

            document.getElementById(day).appendChild(studentItem);
          }
        });
      });
    })
    .catch((error) => {
      console.error("Erro ao obter os estudantes disponíveis:", error);
    });
}

function updateSelect() {
  let select = document.getElementById("gradeReference");

  select.disabled = false;
  select.value = "-1";

  const inputDate = new Date(document.getElementById("date").value);

  const filterDictionary = {
    0: "seg",
    1: "ter",
    2: "qua",
    3: "qui",
    4: "sex",
  };

  let filter = filterDictionary[inputDate.getDay()];

  Array.from(select.options).forEach((option) => {
    const display = option.text.includes(filter);
    option.style.display = display ? "block" : "none";
  });
}

fetch("http://localhost:3000/api/grades")
  .then((response) => response.json())
  .then((data) => {
    const gradeDropdown = document.getElementById("gradeReference");

    data = data.sort((a,b) => a._id - b._id)

    document.getElementById("nextGrade").value = String(Number(data[data.length - 1]._id) + 1);

    data = data.sort((a,b) => sortGrade(a.description,b.description))

    data.forEach((grade) => {
      const option = document.createElement("option");
      option.value = grade._id;
      option.text = `${grade.description} (${grade._id})`;
      gradeDropdown.appendChild(option);
    });
    load_students(data);
  })
  .catch((error) => {
    console.error("Erro ao obter as grade disponíveis:", error);
  });