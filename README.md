# fest-sun-blocks

Встраиваемые блоки для лендингов событий ретрит-центра «Энергия Солнца» на Тильде:
fest-sun.ru (фестиваль «Энергия Солнца»), fest-sun.ru/retreatmaster (ретрит «Круг мастеров») и следующие события.

Хостинг – GitHub Pages: **https://xenaja.github.io/fest-sun-blocks/**
Демо всех блоков: **https://xenaja.github.io/fest-sun-blocks/index.html**

Тексты и цены меняются только здесь, в репозитории. В Тильде стоят короткие сниппеты, их трогать не нужно.

## Как поставить блок на Тильду

1. Добавьте на страницу блок **T123 (HTML-код)**.
2. Вставьте сниппет нужного блока (ниже).
3. Строку со `<script>` достаточно вставить **один раз на страницу** – например, в самый первый T123 или в настройки страницы. Если она окажется в нескольких блоках, ничего не сломается.

Атрибуты контейнера:

| атрибут | что значит |
|---|---|
| `data-block` | какой блок: `text`, `faq`, `prices`, `rooms`, `specials`, `masters`, `alumni`, `reflinks` |
| `data-event` | событие: `energiya-solntsa`, `krug-masterov`, … (папка в `events/`) |
| `data-audience` | `new` – страница для гостей, `partner` – для партнёров Full Energy |
| `data-name` | только для `text`: какой файл показать (`about` → `content/about.md`) |
| `data-variant` | фон секции: не указан – светлый, `soft` – молочный, `dark` – тёмный |
| `data-title` | заменить заголовок блока, не трогая данные |
| `id` | якорь для меню, например `id="prices"` |

### Сниппеты для «Энергии Солнца»

Скрипт (один раз на страницу):

```html
<script src="https://xenaja.github.io/fest-sun-blocks/fs.js"></script>
```

**reflinks** – ничего не рисует. Кнопки «Участвую» с ссылками `#popup:myform`, `vk.com/app6013442…` и `wa.me/…` начинают вести в бота @fest_sun_bot с меткой события. Если человек пришёл по ссылке с `?ref=XXX`, метка передаётся в бота (`e_fest__s_XXX`) и запоминается в браузере.

```html
<div class="fs-block" data-block="reflinks" data-event="energiya-solntsa"></div>
```

**text** – текстовая секция из `content/<name>.md`:

```html
<div class="fs-block" data-block="text" data-name="about" data-event="energiya-solntsa" data-audience="new"></div>
<div class="fs-block" data-block="text" data-name="benefits" data-event="energiya-solntsa" data-audience="new" data-variant="soft"></div>
<div class="fs-block" data-block="text" data-name="program" data-event="energiya-solntsa" data-audience="new"></div>
<div class="fs-block" data-block="text" data-name="kids" data-event="energiya-solntsa" data-audience="new" data-variant="soft"></div>
<div class="fs-block" data-block="text" data-name="business" data-event="energiya-solntsa" data-audience="new" data-variant="dark"></div>
<div class="fs-block" data-block="text" data-name="food" data-event="energiya-solntsa" data-audience="new"></div>
```

Тексты `about`, `benefits`, `program`, `kids` (в `events/energiya-solntsa/content/`) и `food` (в `shared/content/`) – черновики заказчика, правятся только по его просьбе.

**prices** – оргвзнос по волнам. Без `data-audience` показывает обе колонки:

```html
<div class="fs-block" data-block="prices" data-event="energiya-solntsa" data-audience="new" id="prices"></div>
```

**invite** – «Приглашайте на фестиваль новичков», только для партнёров. Ставится на странице партнёров сразу после prices; на странице гостей скрывается сам:

```html
<div class="fs-block" data-block="text" data-name="invite" data-event="energiya-solntsa" data-audience="partner"></div>
```

**Кнопка меню «Участвую» → к стоимости.** В настройках меню Тильды поставьте кнопке ссылку `#prices` (у блока prices в сниппете есть `id="prices"`). Скрипт плавно прокрутит к блоку с отступом под закреплённое меню (80 px; меняется переменной темы `--fs-anchor-offset`). Ссылки `#prices` reflinks не трогает.

**rooms** – проживание с питанием, переключатель длительностей, галереи номеров:

```html
<div class="fs-block" data-block="rooms" data-event="energiya-solntsa" data-audience="new"></div>
```

**specials** – цены спецпрограмм по волнам:

```html
<div class="fs-block" data-block="specials" data-event="energiya-solntsa" data-audience="new"></div>
```

**masters** – карточки мастеров, «Подробнее» открывает полный текст. **alumni** – лента «У нас уже выступали»:

```html
<div class="fs-block" data-block="masters" data-event="energiya-solntsa" data-audience="new"></div>
<div class="fs-block" data-block="alumni" data-event="energiya-solntsa" data-audience="new"></div>
```

**faq** – вопросы события, затем общие:

```html
<div class="fs-block" data-block="faq" data-event="energiya-solntsa" data-audience="new"></div>
```

На странице для партнёров во всех сниппетах `data-audience="partner"`. Для «Круга мастеров» – `data-event="krug-masterov"`.

### Сниппеты для «Круга мастеров» (fest-sun.ru/retreatmaster)

Демо всего лендинга: **https://xenaja.github.io/fest-sun-blocks/krug.html**. Основа страницы – блоки на коде; блоки с иллюстрациями и иконками делаются в Тильде и ставятся между ними.

```html
<div class="fs-block" data-block="reflinks" data-event="krug-masterov"></div>
<div class="fs-block" data-block="hero" data-event="krug-masterov"></div>
<div class="fs-block" data-block="text" data-name="about" data-event="krug-masterov" id="about"></div>
<div class="fs-block" data-block="text" data-name="program" data-event="krug-masterov" data-variant="soft" id="program"></div>
<div class="fs-block" data-block="text" data-name="formats" data-event="krug-masterov"></div>
<div class="fs-block" data-block="text" data-name="fair" data-event="krug-masterov" data-variant="soft"></div>
<div class="fs-block" data-block="masters" data-event="krug-masterov" id="masters"></div>
<div class="fs-block" data-block="text" data-name="masters-offer" data-event="krug-masterov" data-variant="dark"></div>
<div class="fs-block" data-block="rooms" data-event="krug-masterov"></div>
<div class="fs-block" data-block="text" data-name="join" data-event="krug-masterov" data-variant="soft" id="join"></div>
<div class="fs-block" data-block="faq" data-event="krug-masterov"></div>
```

Для мастеров два варианта текста: `masters-offer` (список возможностей) и `masters-offer-2` («почему выгодно», с Full Energy). На странице ставится один.

**hero** – первый экран, данные в `event.json` → `hero`: `eyebrow` (надзаголовок), `kicker` и `title` (заголовок H1 в две строки), `lead`, `dates`, `buttons`, `image`. Иллюстрацию положите в `events/<id>/img/` и впишите путь: `"image": "img/hero.jpg"` – поверх неё ляжет затемнение для читаемости (`--fs-hero-overlay` в теме). Пока картинки нет – фон из градиента темы (`--fs-hero-bg`).

## Как устроены данные

```
fs.js                          – скрипт: рендер всех блоков и их стили
themes/<theme>.css             – оформление события (только CSS-переменные --fs-*)
shared/                        – общее для всех событий
  center.json                  – ретрит-центр, номера, фото, цены проживания с питанием
  masters.json                 – все мастера: id, имя, регалии, short, фото
  specials.json                – спецпрограммы: id, название, описание
  content/masters/<id>.md      – полные тексты мастеров
  content/faq-common.md        – общие вопросы
  content/food.md, route.md    – питание, как добраться (через блок text)
  img/                         – фото мастеров и номеров
events/<event-id>/
  event.json                   – даты, тема, длительности, оргвзнос и волны, спецпрограммы,
                                 мастера, бот
  content/*.md                 – тексты события (about, program, faq…)
  img/                         – картинки события
```

**Правило слияния:** блок берёт данные события, а если их нет – общие. Например, `data-name="food"` ищет `events/<id>/content/food.md`, не находит и берёт `shared/content/food.md`. Блок faq показывает вопросы события, затем общие.

Пути к картинкам в JSON – относительно папки этого JSON: в `shared/masters.json` путь `img/masters/valeeva.webp` означает `shared/img/masters/valeeva.webp`.

## Как поменять…

После любой правки поднимите `VERSION` в начале `fs.js` (например, `2026.10.16-1` → `2026.10.16-2`). По нему у посетителей сбрасывается кэш данных. Сам GitHub Pages обновляет файлы за 1–5 минут, браузеры держат старую версию `fs.js` до 10 минут.

**Текст.** Откройте нужный `.md` и отредактируйте. Разметка:

```
## Заголовок секции
### Подзаголовок
Абзац. **Жирный**, [ссылка](https://fest-sun.ru).
- пункт списка
1. нумерованный пункт
> цитата

::: partner
Это видят только партнёры (data-audience="partner").
:::

::: new
Это видят только гости.
:::

::: cards
### Карточка
- пункт
### Вторая карточка
- пункт
:::
```

Раскладка «рядом» (слева заголовок и первая фраза, справа остальной текст) включается строками в самом начале файла:

```
---
layout: split
---
```

Так оформлен `about.md`. Первый абзац после заголовка всегда становится вводным; абзацы внутри `::: new` / `::: partner` выделяются отдельно.

Оформление блока на плашке – `layout: plate` в начале файла (как в `invite.md`). Внутри можно сделать карточки-преимущества и шаги:

```
::: features
- **Заголовок карточки.** Текст.
:::

::: steps
1. Первый шаг
2. Второй шаг
:::
```

Кнопки внутри текста (ведут в бота события; `bot:master` – с меткой «мастер», её видно в карточке заявки):

```
::: buttons
[[Зарегистрироваться как участник]](bot)
[[Подать заявку как мастер]](bot:master)
:::
```

Вторая кнопка в ряду – контурная. Карточки сеткой 2×2 – `::: cards-2` (как `::: cards`).

Абзац по центру:

```
::: center
Текст по центру.
:::
```

Тире в текстах – только среднее (–). Числа в ценах форматируются сами: `10000` в JSON → «10 000 ₽».

**Цену оргвзноса.** `events/<id>/event.json` → `fee.waves`: у каждой волны `partner` и `new`. `0` показывается как «В подарок».

**Текущую волну.** `fee.current_wave`: `1`, `2` или `3`. Прошедшие волны зачёркиваются, текущая отмечается «сейчас» – и в стоимости, и в спецпрограммах.

**Заголовок спецпрограмм.** `event.json` → `specials.title`: пустая строка `""` – блок без заголовка (когда заголовок уже стоит в Тильде).

**Плашку подарка, рассрочку, кнопку.** `fee.gift`, `fee.installment`, `fee.button`. Чтобы убрать плашку, удалите строку `gift`.

**Цены проживания.** `shared/center.json` → у номера `per_day`: цена за человека в сутки при 1/2/3/4 жильцах, `null` – так поселить нельзя. Цена в таблице = `per_day × длительность`. Если на какой-то срок цена особая, добавьте `"fixed": { "7": { "2": 30000 } }`.

**Длительности.** `event.json` → `durations`, например `[7, 10]` или `[7]`.

**Мастера.** Новый мастер – запись в `shared/masters.json` (+ фото в `shared/img/masters/` и текст `shared/content/masters/<id>.md`), затем его `id` в `masters` нужного `event.json`. Чтобы показать мастера только на одной странице: `{ "id": "valeeva", "audience": "partner" }`. `pos` и `zoom` – кадрирование фото в кружке.

**Спецпрограммы.** Список – `shared/specials.json`, какие и по какой цене у события – `event.json` → `specials.items` и `specials.prices` (по волнам). Особая цена у одной программы: `{ "id": "banya", "prices": [3000, 4000, 5000] }`.

**Бот.** `event.json` → `bot.telegram` и `bot.start` (`e_fest` у фестиваля, `e_masters` у Круга мастеров – как в `config/events.yaml` бота).

## Как добавить новое событие

1. Скопируйте папку `events/krug-masterov` в `events/<новый-id>` (латиница, цифры, дефис).
2. В `event.json` поменяйте `id`, `title`, `dates`, `durations`, `fee`, `masters`, `bot.start`.
3. Тема: либо укажите существующую (`"theme": "energiya-solntsa"`), либо скопируйте `themes/krug-masterov.css` в `themes/<новая>.css`, замените класс `.fs-theme-krug-masterov` на `.fs-theme-<новая>` и поменяйте значения переменных.
4. Тексты – в `events/<новый-id>/content/`.
5. В сниппетах на Тильде – `data-event="<новый-id>"`.

## Темы: переменные --fs-*

Все цвета, шрифты, скругления, тени и отступы блоков берутся только из переменных – в коде блоков нет ни одного цвета. Основные:

| переменная | что красит |
|---|---|
| `--fs-bg`, `--fs-bg-soft`, `--fs-fg`, `--fs-title`, `--fs-muted`, `--fs-line` | светлая секция |
| `--fs-dark-bg`, `--fs-dark-fg`, `--fs-dark-title`, `--fs-dark-muted`, `--fs-dark-line`, `--fs-dark-card-bg` | тёмная секция (`data-variant="dark"`, мастера) |
| `--fs-card-bg`, `--fs-card-fg`, `--fs-card-title`, `--fs-card-line` | карточки, акцентная колонка цены |
| `--fs-accent`, `--fs-gold`, `--fs-highlight`, `--fs-highlight-fg`, `--fs-ray`, `--fs-ring`, `--fs-past` | акценты, рамка мастеров, «сейчас», прошедшие волны |
| `--fs-btn-bg`, `--fs-btn-fg`, `--fs-btn-bg-hover` | кнопка |
| `--fs-radius`, `--fs-btn-radius`, `--fs-shadow` | скругления и тени |
| `--fs-font-head`, `--fs-font-body`, `--fs-head-weight` | шрифты (по умолчанию наследуются от Тильды) |
| `--fs-width`, `--fs-pad-y`, `--fs-pad-y-mobile` | ширина и отступы секций |

## Надёжность

- Скрипт без зависимостей и сборки, стили вставляет сам, все классы с префиксом `fs-`.
- Если файл не загрузился или событие не найдено, блок скрывается, остальная страница работает. Причина пишется в консоль браузера с пометкой `[fest-sun-blocks]`.
- Адаптив от 320 px, без горизонтальной прокрутки страницы.

## Что пока заглушки

- Цены и номера в `shared/center.json`, фото номеров (`shared/img/rooms/placeholder-*.svg`).
- Даты «Энергии Солнца».
- Тексты: faq, route, описания спецпрограмм, тексты Юры Ра и Андрея Захаревича.
- «Круг мастеров»: иллюстрация первого экрана, цены (оргвзнос), вопросы события, тексты мастеров.

## Проверка локально

```
python -m http.server 8765
```

и открыть http://127.0.0.1:8765/index.html (с `file://` данные не загрузятся).
