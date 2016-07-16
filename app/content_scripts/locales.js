const LOCALES = {
    "en": {
        add: "Add",
        addUsers: "Add users",
        del: "Delete",
        hideChart: "Hide chart",
        judgeIDDoesntExist: "This user doesn't exist!",
        judgeIDNotEnoughOfAccepted: "The user must have at least two solved problems!",
        judgeIDIncorrectFormat: "Incorrect Judge ID format (there's no digits)!",
        judgeIDIsAlreadyAdded: "This Judge ID has already been added!",
        judgeIDLabel: "Judge ID or link:",
        queryFailed: "An error occured on the request to the server.",
        refreshPage: "Try to refresh the page.",
        showChart: "Show chart",
        version: "version",
        wrongJudgeID: "There's no submits on this Judge ID",
        highlightLastSolvedProblems: "Mark recent ACs",
        notEnoughData: "Too little data for the chart",
    },
    "ru": {
        add: "Добавить",
        addUsers: "Добавить пользователей",
        del: "Удалить",
        hideChart: "Скрыть график",
        judgeIDDoesntExist: "Такого пользователя не существует!",
        judgeIDNotEnoughOfAccepted: "Пользователь должен иметь не менее двух решённых задач!",
        judgeIDIncorrectFormat: "Некорректный формат Judge ID (нет цифр)!",
        judgeIDIsAlreadyAdded: "Этот Judge ID уже присутствует на графике!",
        judgeIDLabel: "Judge ID или ссылка:",
        queryFailed: "Произошла ошибка при запросе к серверу. ",
        refreshPage: "Попробуйте обновить страницу.",
        showChart: "Показать график",
        version: "версия",
        wrongJudgeID: "Не найдено посылок по этому Judge ID",
        highlightLastSolvedProblems: "Выделять недавние AC",
        notEnoughData: "Слишком мало данных для графика",
    },
};

var locale = LOCALES.en;

function updateLocale(observer, callback) {
    observer.forEachTextIn('.panel a[href="/news.aspx"]', newsLabel => {
        locale = LOCALES[newsLabel.textContent === 'Site news' ? 'en' : 'ru'];
        callback();
    });
}
