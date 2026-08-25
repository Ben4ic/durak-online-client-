"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "ru" | "uk";

const labels: Record<Language, Record<string, string>> = {
  en: {
    "Lobby":"Lobby","Welcome back, Player":"Welcome back, Player","Home":"Home","Games":"Games","Tournaments":"Tournaments","History":"History","Friends":"Friends","Wallet":"Wallet","Profile":"Profile","Settings":"Settings","Log out":"Log out",
    "Balance":"Balance","Quick Game":"Quick Game","Choose Mode":"Choose Mode","Play with Friend":"Play with Friend","Rating":"Rating","Daily Reward":"Daily Reward","Claim Bonus":"Claim Bonus","Recent Games":"Recent Games","View All":"View All",
    "Choose Game Mode":"Choose Game Mode","Instant":"Instant","Play vs Bot":"Play vs Bot","Practice a complete game against the built-in bot. No second player is needed.":"Practice a complete game against the built-in bot. No second player is needed.","Start training game":"Start training game","2 Players":"2 Players","Play Online":"Play Online","Play against another registered player. Use quick match or create a private room with a code.":"Play against another registered player. Use quick match or create a private room with a code.","Find a real opponent":"Find a real opponent",
    "Online Match":"Online Match","Waiting for opponent":"Waiting for opponent","Send the room ID or invite link to another registered player.":"Send the room ID or invite link to another registered player.","Copy link":"Copy link","Cancel room":"Cancel room","Quick Match":"Quick Match","Automatically connect with another player who is searching.":"Automatically connect with another player who is searching.","Find opponent":"Find opponent","Create Room":"Create Room","Get a private room ID and invite link.":"Get a private room ID and invite link.","Create room":"Create room","Join by ID":"Join by ID","Enter the six-character room ID.":"Enter the six-character room ID.","ROOM ID":"ROOM ID","Join":"Join","Public Lobby":"Public Lobby","Rooms waiting for a second player":"Rooms waiting for a second player","Waiting":"Waiting","players":"players","No public rooms are waiting right now.":"No public rooms are waiting right now.","Invite flow":"Invite flow","Create a room, copy its ID or invite link, and send it to another player. If they are already logged in, the link opens the Online screen with the room ID filled in.":"Create a room, copy its ID or invite link, and send it to another player. If they are already logged in, the link opens the Online screen with the room ID filled in.",
    "Classic Durak · 1v1 vs Bot":"Classic Durak · 1v1 vs Bot","Bot":"Bot","Dealing...":"Dealing...","Bot thinking...":"Bot thinking...","Your attack":"Your attack","Your defense":"Your defense","Table is clear":"Table is clear","You win!":"You win!","Bot wins":"Bot wins","Draw":"Draw","Take":"Take","Play card":"Play card","Done":"Done","New game":"New game","Game chat":"Game chat","Bot practice chat":"Bot practice chat","Message...":"Message...",
    "Classic Durak · Online":"Classic Durak · Online","Connected":"Connected","Reconnecting":"Reconnecting","You attack":"You attack","You defend":"You defend","New online game":"New online game",
    "Profile":"Profile","Member since August 2026":"Member since August 2026","Games played":"Games played","Wins":"Wins","Win rate":"Win rate","Best streak":"Best streak","Achievements":"Achievements",
    "Game History":"Game History","Net result":"Net result","Recent matches":"Recent matches","Friends":"Friends","Search player":"Search player","Your invite code":"Your invite code",
    "Available balance":"Available balance","Locked":"Locked","Bonus":"Bonus","Deposit":"Deposit","Withdraw":"Withdraw","Amount":"Amount","Continue deposit":"Continue deposit","Continue withdrawal":"Continue withdrawal","Prototype only. No payment provider or real-money transaction is connected.":"Prototype only. No payment provider or real-money transaction is connected.","Transactions":"Transactions",
    "Game":"Game","Game sounds":"Game sounds","Move notifications":"Move notifications","Friend invites":"Friend invites","Account":"Account","Change username":"Change username","Security":"Security",
    "Finding opponent":"Finding opponent","Searching for a player with a similar rating...":"Searching for a player with a similar rating...","Stake":"Stake","Search time":"Search time","Secure match queue":"Secure match queue","Cancel search":"Cancel search",
    "Victory!":"Victory!","Defeat":"Defeat","You received":"You received","Result":"Result","Better luck next game":"Better luck next game","Rematch":"Rematch","Back to lobby":"Back to lobby",
    "Open":"Open","Upcoming":"Upcoming","Prize pool":"Prize pool","Join tournament":"Join tournament",
    "Welcome back":"Welcome back","Sign in to continue to your account.":"Sign in to continue to your account.","Email":"Email","Password":"Password","Sign in":"Sign in","Create account":"Create account","Username":"Username"
  },
  ru: {
    "Lobby":"Лобби","Welcome back, Player":"С возвращением, Player","Home":"Главная","Games":"Игры","Tournaments":"Турниры","History":"История","Friends":"Друзья","Wallet":"Кошелёк","Profile":"Профиль","Settings":"Настройки","Log out":"Выйти",
    "Balance":"Баланс","Quick Game":"Быстрая игра","Choose Mode":"Выбрать режим","Play with Friend":"Играть с другом","Rating":"Рейтинг","Daily Reward":"Ежедневная награда","Claim Bonus":"Забрать бонус","Recent Games":"Последние игры","View All":"Смотреть все",
    "Choose Game Mode":"Выберите режим игры","Instant":"Сразу","Play vs Bot":"Играть с ботом","Practice a complete game against the built-in bot. No second player is needed.":"Сыграйте полноценную партию против встроенного бота. Второй игрок не нужен.","Start training game":"Начать игру с ботом","2 Players":"2 игрока","Play Online":"Играть онлайн","Play against another registered player. Use quick match or create a private room with a code.":"Играйте против другого зарегистрированного игрока. Используйте быстрый поиск или создайте приватную комнату по коду.","Find a real opponent":"Найти реального соперника",
    "Online Match":"Онлайн-матч","Waiting for opponent":"Ожидание соперника","Send the room ID or invite link to another registered player.":"Отправьте ID комнаты или ссылку-приглашение другому зарегистрированному игроку.","Copy link":"Скопировать ссылку","Cancel room":"Отменить комнату","Quick Match":"Быстрый поиск","Automatically connect with another player who is searching.":"Автоматически подключиться к другому игроку, который сейчас ищет матч.","Find opponent":"Найти соперника","Create Room":"Создать комнату","Get a private room ID and invite link.":"Получите приватный ID комнаты и ссылку-приглашение.","Create room":"Создать комнату","Join by ID":"Войти по ID","Enter the six-character room ID.":"Введите шестизначный ID комнаты.","ROOM ID":"ID КОМНАТЫ","Join":"Войти","Public Lobby":"Общее лобби","Rooms waiting for a second player":"Комнаты, ожидающие второго игрока","Waiting":"Ожидание","players":"игрока","No public rooms are waiting right now.":"Сейчас нет открытых комнат в ожидании.","Invite flow":"Приглашение","Create a room, copy its ID or invite link, and send it to another player. If they are already logged in, the link opens the Online screen with the room ID filled in.":"Создайте комнату, скопируйте ID или ссылку и отправьте другому игроку. Если он уже вошёл в аккаунт, ссылка откроет онлайн-экран с заполненным ID комнаты.",
    "Classic Durak · 1v1 vs Bot":"Классический Дурак · 1 на 1 с ботом","Bot":"Бот","Dealing...":"Раздача...","Bot thinking...":"Бот думает...","Your attack":"Ваш ход","Your defense":"Вы отбиваетесь","Table is clear":"Стол пуст","You win!":"Вы победили!","Bot wins":"Бот победил","Draw":"Ничья","Take":"Беру","Play card":"Сходить картой","Done":"Бито","New game":"Новая игра","Game chat":"Чат игры","Bot practice chat":"Тренировочный чат с ботом","Message...":"Сообщение...",
    "Classic Durak · Online":"Классический Дурак · Онлайн","Connected":"Подключено","Reconnecting":"Переподключение","You attack":"Вы ходите","You defend":"Вы отбиваетесь","New online game":"Новая онлайн-игра",
    "Member since August 2026":"В игре с августа 2026","Games played":"Сыграно игр","Wins":"Победы","Win rate":"Процент побед","Best streak":"Лучшая серия","Achievements":"Достижения",
    "Game History":"История игр","Net result":"Общий результат","Recent matches":"Последние матчи","Search player":"Найти игрока","Your invite code":"Ваш код приглашения",
    "Available balance":"Доступный баланс","Locked":"Заблокировано","Bonus":"Бонус","Deposit":"Пополнить","Withdraw":"Вывести","Amount":"Сумма","Continue deposit":"Продолжить пополнение","Continue withdrawal":"Продолжить вывод","Prototype only. No payment provider or real-money transaction is connected.":"Только прототип. Платежи и реальные деньги не подключены.","Transactions":"Транзакции",
    "Game":"Игра","Game sounds":"Звуки игры","Move notifications":"Уведомления о ходе","Friend invites":"Приглашения друзей","Account":"Аккаунт","Change username":"Изменить имя","Security":"Безопасность",
    "Finding opponent":"Поиск соперника","Searching for a player with a similar rating...":"Ищем игрока с похожим рейтингом...","Stake":"Ставка","Search time":"Время поиска","Secure match queue":"Безопасная очередь поиска","Cancel search":"Отменить поиск",
    "Victory!":"Победа!","Defeat":"Поражение","You received":"Вы получили","Result":"Результат","Better luck next game":"Повезёт в следующей игре","Rematch":"Реванш","Back to lobby":"Вернуться в лобби",
    "Open":"Открыт","Upcoming":"Скоро","Prize pool":"Призовой фонд","Join tournament":"Участвовать",
    "Welcome back":"С возвращением","Sign in to continue to your account.":"Войдите, чтобы продолжить.","Email":"Email","Password":"Пароль","Sign in":"Войти","Create account":"Создать аккаунт","Username":"Имя пользователя"
  },
  uk: {
    "Lobby":"Лобі","Welcome back, Player":"З поверненням, Player","Home":"Головна","Games":"Ігри","Tournaments":"Турніри","History":"Історія","Friends":"Друзі","Wallet":"Гаманець","Profile":"Профіль","Settings":"Налаштування","Log out":"Вийти",
    "Balance":"Баланс","Quick Game":"Швидка гра","Choose Mode":"Обрати режим","Play with Friend":"Грати з другом","Rating":"Рейтинг","Daily Reward":"Щоденна нагорода","Claim Bonus":"Забрати бонус","Recent Games":"Останні ігри","View All":"Переглянути все",
    "Choose Game Mode":"Оберіть режим гри","Instant":"Одразу","Play vs Bot":"Грати з ботом","Practice a complete game against the built-in bot. No second player is needed.":"Зіграйте повну партію проти вбудованого бота. Другий гравець не потрібен.","Start training game":"Почати гру з ботом","2 Players":"2 гравці","Play Online":"Грати онлайн","Play against another registered player. Use quick match or create a private room with a code.":"Грайте проти іншого зареєстрованого гравця. Використовуйте швидкий пошук або створіть приватну кімнату за кодом.","Find a real opponent":"Знайти реального суперника",
    "Online Match":"Онлайн-матч","Waiting for opponent":"Очікування суперника","Send the room ID or invite link to another registered player.":"Надішліть ID кімнати або посилання-запрошення іншому зареєстрованому гравцю.","Copy link":"Копіювати посилання","Cancel room":"Скасувати кімнату","Quick Match":"Швидкий пошук","Automatically connect with another player who is searching.":"Автоматично підключитися до іншого гравця, який зараз шукає матч.","Find opponent":"Знайти суперника","Create Room":"Створити кімнату","Get a private room ID and invite link.":"Отримайте приватний ID кімнати та посилання-запрошення.","Create room":"Створити кімнату","Join by ID":"Увійти за ID","Enter the six-character room ID.":"Введіть шестизначний ID кімнати.","ROOM ID":"ID КІМНАТИ","Join":"Увійти","Public Lobby":"Загальне лобі","Rooms waiting for a second player":"Кімнати, що очікують другого гравця","Waiting":"Очікування","players":"гравці","No public rooms are waiting right now.":"Зараз немає відкритих кімнат в очікуванні.","Invite flow":"Запрошення","Create a room, copy its ID or invite link, and send it to another player. If they are already logged in, the link opens the Online screen with the room ID filled in.":"Створіть кімнату, скопіюйте ID або посилання й надішліть іншому гравцю. Якщо він уже увійшов, посилання відкриє онлайн-екран із заповненим ID кімнати.",
    "Classic Durak · 1v1 vs Bot":"Класичний Дурень · 1 на 1 з ботом","Bot":"Бот","Dealing...":"Роздача...","Bot thinking...":"Бот думає...","Your attack":"Ваш хід","Your defense":"Ви відбиваєтесь","Table is clear":"Стіл порожній","You win!":"Ви перемогли!","Bot wins":"Бот переміг","Draw":"Нічия","Take":"Беру","Play card":"Зіграти карту","Done":"Бито","New game":"Нова гра","Game chat":"Чат гри","Bot practice chat":"Тренувальний чат із ботом","Message...":"Повідомлення...",
    "Classic Durak · Online":"Класичний Дурень · Онлайн","Connected":"Підключено","Reconnecting":"Перепідключення","You attack":"Ви ходите","You defend":"Ви відбиваєтесь","New online game":"Нова онлайн-гра",
    "Member since August 2026":"У грі з серпня 2026","Games played":"Зіграно ігор","Wins":"Перемоги","Win rate":"Відсоток перемог","Best streak":"Найкраща серія","Achievements":"Досягнення",
    "Game History":"Історія ігор","Net result":"Загальний результат","Recent matches":"Останні матчі","Search player":"Знайти гравця","Your invite code":"Ваш код запрошення",
    "Available balance":"Доступний баланс","Locked":"Заблоковано","Bonus":"Бонус","Deposit":"Поповнити","Withdraw":"Вивести","Amount":"Сума","Continue deposit":"Продовжити поповнення","Continue withdrawal":"Продовжити виведення","Prototype only. No payment provider or real-money transaction is connected.":"Лише прототип. Платежі та реальні гроші не підключені.","Transactions":"Транзакції",
    "Game":"Гра","Game sounds":"Звуки гри","Move notifications":"Сповіщення про хід","Friend invites":"Запрошення друзів","Account":"Акаунт","Change username":"Змінити ім’я","Security":"Безпека",
    "Finding opponent":"Пошук суперника","Searching for a player with a similar rating...":"Шукаємо гравця зі схожим рейтингом...","Stake":"Ставка","Search time":"Час пошуку","Secure match queue":"Безпечна черга пошуку","Cancel search":"Скасувати пошук",
    "Victory!":"Перемога!","Defeat":"Поразка","You received":"Ви отримали","Result":"Результат","Better luck next game":"Пощастить у наступній грі","Rematch":"Реванш","Back to lobby":"Повернутися в лобі",
    "Open":"Відкритий","Upcoming":"Незабаром","Prize pool":"Призовий фонд","Join tournament":"Взяти участь",
    "Welcome back":"З поверненням","Sign in to continue to your account.":"Увійдіть, щоб продовжити.","Email":"Email","Password":"Пароль","Sign in":"Увійти","Create account":"Створити акаунт","Username":"Ім’я користувача"
  }
};

type Ctx = {
  language: Language;
  setLanguage: (lang: Language) => void;
  tr: (text: string) => string;
};

const I18nContext = createContext<Ctx>({
  language: "en",
  setLanguage: () => {},
  tr: (text) => text,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("durak-language") as Language | null;
    if (stored && ["en", "ru", "uk"].includes(stored)) {
      setLanguageState(stored);
      document.documentElement.lang = stored === "uk" ? "uk" : stored;
    }
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem("durak-language", lang);
    document.documentElement.lang = lang === "uk" ? "uk" : lang;
  }

  const value = useMemo<Ctx>(() => ({
    language,
    setLanguage,
    tr: (text: string) => labels[language][text] ?? text,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
