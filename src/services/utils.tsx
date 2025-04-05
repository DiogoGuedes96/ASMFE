import moment from "moment";

const getNextSevenDays = (targetDay: any) => {
  const days = [];

  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(targetDay);
    nextDate.setDate(targetDay.getDate() + i);

    const day = nextDate.getDate();
    const month = nextDate.getMonth() + 1;
    const year = nextDate.getFullYear();
    const weekDay = capitalized(
      nextDate
        .toLocaleDateString("pt-BR", { weekday: "long" })
        .split("-")[0]
        .trim()
    );
    const label = formatDates(
      { day, month, year, weekDay },
      nextDate,
      currentDate
    );
    days.push({ day, month, year, weekDay, label, key: i, date: nextDate });
  }

  return days;
};

const formatArrayFromDates = (dates: any) => {
  return dates.map(
    (date: any) =>
      `${date.day < 10 ? `0${date.day}` : date.day}-${date.month < 10 ? `0${date.month}` : date.month
      }-${date.year}`
  );
};

const prepareDateToShow = (date: any, currentDate = new Date()) => {
  const [year, month, day] = date.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const weekOfDay = utcDate.getDay();
  const weekDay = capitalizedWeekDay(weekOfDay);

  const label = formatDates(
    { day, month, year, weekDay },
    utcDate,
    currentDate
  );

  return { day, month, year, weekDay, label };
};

const capitalizedWeekDay = (weekOfDay: number) => {
  switch (weekOfDay) {
    case 0:
      return "Domingo";
    case 1:
      return "Segunda-feira";
    case 2:
      return "Terça-feira";
    case 3:
      return "Quarta-feira";
    case 4:
      return "Quinta-feira";
    case 5:
      return "Sexta-feira";
    case 6:
      return "Sábado";
    default:
      return "";
  }
};

const capitalized = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatDates = (date: any, targetDate: any, currentDate: any) => {
  const { day, month, year, weekDay } = date;

  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  let nameDay = "";

  if (targetDate.getTime() === currentDate.getTime()) {
    nameDay = "Hoje - ";
  }

  if (targetDate.getTime() === currentDate.getTime() + 24 * 60 * 60 * 1000) {
    nameDay = "Amanhã - ";
  }

  return `${nameDay}${weekDay}, ${day} de ${getMonthName(month)}, ${year}`;
};

const getMonthName = (month: number) => {
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return monthNames[month - 1];
};

const disabledDateMin = (current:any) => {
  return current && current < moment().startOf("day");
}

const authorizedAccess = (
  modulePermissions: string[],
  permissions: string[]
) => {
  return permissions.some((permission: string) => modulePermissions.includes(permission));
}


const isWhitespace = (value: string) => /^\s*$/.test(value);

const REQUIRED_FIELD_LABEL = "Campo obrigatório";
const NOT_REGISTERED_LABEL = "Não registado";

export {
  getNextSevenDays,
  getMonthName,
  formatDates,
  prepareDateToShow,
  formatArrayFromDates,
  disabledDateMin,
  isWhitespace,
  authorizedAccess,
  REQUIRED_FIELD_LABEL,
  NOT_REGISTERED_LABEL,
};
