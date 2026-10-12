
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const dataPath = path.join(__dirname, "data.json");

// Настройки EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Чтение данных из JSON
function readData() {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

// Сохранение данных в JSON
function saveData(data) {
    fs.writeFileSync(
        dataPath,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

// Главная страница
app.get("/", (req, res) => {
    const places = readData();

    res.render("index", {
        title: "Тур-гид по Астане",
        places: places
    });
});

// Страница добавления
app.get("/add", (req, res) => {
    res.render("add", {
        title: "Добавить место",
        errors: [],
        formData: {}
    });
});

// Обработка формы
app.post("/add", (req, res) => {
    const { title, description, category, time, image } = req.body;
    const errors = [];

    // Проверяем название
    if (!title || title.trim().length < 8) {
        errors.push("Название должно содержать минимум 8 символов.");
    }

    // Проверяем описание
    if (!description || description.trim().length < 10) {
        errors.push("Описание должно содержать минимум 10 символов.");
    }

    // Проверяем категорию
    if (!category || category.trim() === "") {
        errors.push("Укажите категорию.");
    }

    // Проверяем время
    if (!time || time.trim() === "") {
        errors.push("Укажите время посещения.");
    }

    // Если есть ошибки, показываем форму повторно
    if (errors.length > 0) {
        return res.status(400).render("add", {
            title: "Добавить место",
            errors: errors,
            formData: req.body
        });
    }

    // Читаем существующие места
    const places = readData();

    // Находим максимальный ID
    const maxId = places.reduce((max, place) => {
        return Math.max(max, Number(place.id) || 0);
    }, 0);

    // Создаём новую запись
    const newPlace = {
        id: maxId + 1,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        time: time.trim(),
        image: image ? image.trim() : ""
    };

    // Добавляем и сохраняем
    places.push(newPlace);
    saveData(places);

    // Возвращаемся на главную
    res.redirect("/");
});

// Страница отдельного места
app.get("/place/:id", (req, res) => {
    const places = readData();

    const place = places.find(item =>
        Number(item.id) === Number(req.params.id)
    );

    if (!place) {
        return res.status(404).render("404", {
            title: "Страница не найдена"
        });
    }

    res.render("place", {
        title: place.title,
        place: place
    });
});

// Страница «О проекте»
app.get("/about", (req, res) => {
    res.render("about", {
        title: "О проекте"
    });
});

// Страница 404 для неизвестных адресов
app.use((req, res) => {
    res.status(404).render("404", {
        title: "Страница не найдена"
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
