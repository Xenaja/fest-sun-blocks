# fest-sun-blocks

Встраиваемые блоки для лендингов событий ретрит-центра «Энергия Солнца» на Тильде:
fest-sun.ru (фестиваль «Энергия Солнца»), fest-sun.ru/retreatmaster (ретрит «Круг мастеров»),
soundmystery.ru/newyear («Новогодняя Мистерия») и следующие события.

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
| `data-block` | какой блок: `text`, `faq`, `prices`, `rooms`, `specials`, `masters`, `alumni`, `reflinks`, `partner-cta`, `redirect`, `galaxy`, `footer`, `garland` |
| `data-event` | событие: `energiya-solntsa`, `krug-masterov`, … (папка в `events/`) |
| `data-name` | только для `text`: какой файл показать (`about` → `content/about.md`) |
| `data-variant` | фон секции: не указан – светлый, `soft` – молочный, `dark` – тёмный |
| `data-title` | заменить заголовок блока, не трогая данные |
| `id` | якорь для меню, например `id="prices"` |

### Сниппеты для «Энергии Солнца»

Скрипт (один раз на страницу):

```html
<script src="https://xenaja.github.io/fest-sun-blocks/fs.js"></script>
```

**Одна страница на событие (с 23.10.2026).** Лендинг – для новичков; всё для партнёров (зачем и как приглашать, готовые сообщения, личная ссылка, «Клуб») – в боте. `data-audience` больше не нужен: если остался в старых сниппетах, скрипт его не читает. Партнёры пересылают ссылку на лендинг со своим кодом: `soundmystery.ru/newyear?ref=<код>`.

**reflinks** – ничего не рисует. Кнопки «Участвую» с ссылками `#popup:myform`, `vk.com/app6013442…` и `wa.me/…` начинают вести в бота @fest_sun_bot: `e_fest__s_site` (метка `site` – пришёл с лендинга). Код партнёра из `?ref=XXX` уходит в бота отдельно: `e_fest__s_site__r_XXX`. Код хранится в браузере 30 дней, новый `?ref` заменяет старый; из адресной строки `?ref` не убирается – партнёр может скопировать адрес и переслать. Ссылки на fest-sun.ru и soundmystery.ru внутри страницы тоже получают `?ref=`.

```html
<div class="fs-block" data-block="reflinks" data-event="energiya-solntsa"></div>
```

**text** – текстовая секция из `content/<name>.md`:

```html
<div class="fs-block" data-block="text" data-name="about" data-event="energiya-solntsa"></div>
<div class="fs-block" data-block="text" data-name="benefits" data-event="energiya-solntsa" data-variant="soft"></div>
<div class="fs-block" data-block="text" data-name="program" data-event="energiya-solntsa"></div>
<div class="fs-block" data-block="text" data-name="kids" data-event="energiya-solntsa" data-variant="soft"></div>
<div class="fs-block" data-block="text" data-name="business" data-event="energiya-solntsa" data-variant="dark"></div>
<div class="fs-block" data-block="text" data-name="food" data-event="energiya-solntsa"></div>
```

Тексты `about`, `benefits`, `program`, `kids` (в `events/energiya-solntsa/content/`) и `food` (в `shared/content/`) – черновики заказчика, правятся только по его просьбе.

**Сообщество** – один блок на всех лендингах: «Сообщество, в которое вы попадаете» (раздел `::: new` в `shared/content/community.md`). Раздел `::: partner` («Клуб осознанных миллионеров-долгожителей») на сайте не показывается – его читает бот в меню партнёра:

```html
<div class="fs-block" data-block="text" data-name="community" data-event="novogodnyaya-misteriya" data-variant="soft"></div>
```

У Новогодней Мистерии свой `community.md` (`events/novogodnyaya-misteriya/content/`) – копия общего без «Путешествий по местам Силы». Правки общего текста повторяйте и там.

**О компании** – «Энергия, которой хватает на всё»: Full Energy как генеральный партнёр событий центра и три опоры (тело, сознание, дело). Текст общий для всех лендингов – `shared/content/company.md`; ставится в конце страницы, перед контактами:

```html
<div class="fs-block" data-block="text" data-name="company" data-event="energiya-solntsa"></div>
```

**prices** – оргвзнос по волнам, две колонки рядом: «Участие» и «Для партнёров Full Energy» (на телефоне – одна под другой, партнёрская второй). Подписи колонок – `fee.labels`, строки под ними – `fee.new_note` и `fee.partner_note` в `event.json`:

```html
<div class="fs-block" data-block="prices" data-event="energiya-solntsa" id="prices"></div>
```

**invite** – «Приглашайте новичков»: на сайт больше не ставится, файл `content/invite.md` читает бот (раздел партнёра). Если блок остался на странице, он скрывается сам – весь текст внутри `::: partner`.

**partner-cta** – внизу лендинга, перед контактами: «Вы партнёр Full Energy?» и кнопка «Получить личную ссылку» → `t.me/fest_sun_bot?start=partner__s_site`. Текст – `content/partner-cta.md` события (или общий `shared/content/partner-cta.md`), подпись кнопки – `button:` в начале файла:

```html
<div class="fs-block" data-block="partner-cta" data-event="novogodnyaya-misteriya" data-variant="soft"></div>
```

**redirect** – для старых партнёрских страниц (`soundmystery.ru/newyear_fe`, `fest-sun.ru/fe`): сразу уводит на общий лендинг, сохраняя всю строку запроса (`?ref=…`, utm). `data-to` – путь на том же сайте. В настройках страницы – запрет индексации. Демо: `newyear-fe.html`.

```html
<div class="fs-block" data-block="redirect" data-to="/newyear"></div>
<script src="https://xenaja.github.io/fest-sun-blocks/fs.js"></script>
```

**galaxy** – мягкая анимация галактики на первом экране: мерцающие звёзды, медленное вращение, «дышащая» туманность, изредка падающая звезда. Поставьте HTML-блок (T123) **сразу после** Zero-блока первого экрана и в его настройках – отступы сверху и снизу 0. Скрипт сам найдёт предыдущий Zero-блок (и пару «десктоп/мобильный», если первый экран сделан двумя блоками с разной видимостью) и нарисует звёзды поверх фона, но под надписями и кнопкой. Если галактика нужна на другом блоке – `data-target="#rec123456789"` (через запятую – несколько). `data-stars="0.6"` – реже звёзды, `data-stars="1.5"` – гуще; `data-shooting="0"` – без падающих звёзд. При «уменьшить движение» в системе картинка неподвижна, вне экрана анимация на паузе. Демо – первый блок в `index.html`.

```html
<div class="fs-block" data-block="galaxy"></div>
<script src="https://xenaja.github.io/fest-sun-blocks/fs.js"></script>
```

**footer** – подвал: название и даты события, адрес, контакт (телефон, WhatsApp, Telegram), политика конфиденциальности, ©. Данные – `footer` в `event.json` (`place` – строки адреса, `contacts`, `policy`, `copyright`). `place` и `contacts` необязательны: если на странице над подвалом уже есть блок «Контакты» Тильды, их не задаём, чтобы не дублировать (так у Новогодней Мистерии). Ставится последним блоком страницы, тёмный по умолчанию:

```html
<div class="fs-block" data-block="footer" data-event="novogodnyaya-misteriya"></div>
<script src="https://xenaja.github.io/fest-sun-blocks/fs.js"></script>
```

**garland** – праздничная гирлянда на стыке двух блоков: провод провисает дугами, огоньки по очереди мягко мерцают. Поставьте HTML-блок (T123, отступы 0) между двумя блоками – сам он места не занимает, гирлянда висит поверх стыка. `data-wire="light"` – светлый провод для стыка тёмных блоков. Лучше 2–3 раза на страницу, не чаще. Демо – `newyear.html`. Над нашими блоками гирлянду можно включить без Тильды: `event.json` → `"garlands": ["prices"]` (тип блока или его `data-name`) – так сейчас над стоимостью Новогодней Мистерии.

```html
<div class="fs-block" data-block="garland" data-wire="light"></div>
<script src="https://xenaja.github.io/fest-sun-blocks/fs.js"></script>
```

**Кнопка меню «Участвую» → к стоимости.** В настройках меню Тильды поставьте кнопке ссылку `#prices` (у блока prices в сниппете есть `id="prices"`). Скрипт плавно прокрутит к блоку с отступом под закреплённое меню (80 px; меняется переменной темы `--fs-anchor-offset`). Ссылки `#prices` reflinks не трогает.

**rooms** – проживание с питанием, переключатель длительностей, галереи номеров:

```html
<div class="fs-block" data-block="rooms" data-event="energiya-solntsa"></div>
```

**specials** – цены спецпрограмм по волнам:

```html
<div class="fs-block" data-block="specials" data-event="energiya-solntsa"></div>
```

**masters** – карточки мастеров, «Подробнее» открывает полный текст. **alumni** – лента «У нас уже выступали»:

```html
<div class="fs-block" data-block="masters" data-event="energiya-solntsa"></div>
<div class="fs-block" data-block="alumni" data-event="energiya-solntsa"></div>
```

**faq** – вопросы события, затем общие:

```html
<div class="fs-block" data-block="faq" data-event="energiya-solntsa"></div>
```

Для «Круга мастеров» – `data-event="krug-masterov"`.

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

### Сниппеты для «Новогодней Мистерии» (soundmystery.ru/newyear)

Демо: **https://xenaja.github.io/fest-sun-blocks/newyear.html**. Тема `soundmystery` – цвета и кнопки сайта soundmystery.ru. Основа страницы остаётся в Тильде (первый экран, мастера, стоимость, проживание, галереи, отзывы, контакты), блоки на коде заменяют текстовые секции. `intro` – статус-бар сразу под первым экраном: заголовок и пункты через точки (разметка `::: bar`). Заявки – в бота @fest_sun_bot (`e_newyear`): невидимый блок reflinks переводит все кнопки `#popup:myform` (и тильдовские, и в блоках) в бота, код партнёра `?ref=` передаёт как `e_newyear__s_site__r_<код>`:

```html
<div class="fs-block" data-block="reflinks" data-event="novogodnyaya-misteriya"></div>
```

```html
<div class="fs-block" data-block="text" data-name="intro" data-event="novogodnyaya-misteriya"></div>
<div class="fs-block" data-block="text" data-name="about" data-event="novogodnyaya-misteriya" id="about"></div>
<div class="fs-block" data-block="text" data-name="benefits" data-event="novogodnyaya-misteriya" data-variant="soft"></div>
<div class="fs-block" data-block="text" data-name="audience" data-event="novogodnyaya-misteriya" data-variant="dark"></div>
<div class="fs-block" data-block="masters" data-event="novogodnyaya-misteriya" id="master"></div>
<div class="fs-block" data-block="text" data-name="program" data-event="novogodnyaya-misteriya" id="prog"></div>
```

`id="about"`, `id="master"` и `id="prog"` – якоря пунктов меню сайта «О мистерии», «Ведущие» и «Программа». Мастера: TEYA, Павитра, Захаревич, Ноллендорф, Даная, Юра Ра, Тельминов, Давудов, Марина Давудова (`event.json` → `masters`).

**Стоимость** – блок prices вместо тильдовского «Стоимость» (тот блок в Тильде скрыть). Оргвзнос по волнам (по 33 места) в двух колонках – «Участие» и «Для партнёров Full Energy», рядом карточка «Также оплачивается» (`fee.extras`: фуршет, проживание и питание). Кнопка «Участвую» ведёт в бота:

```html
<div class="fs-block" data-block="prices" data-event="novogodnyaya-misteriya" id="prices"></div>
```

**Внизу страницы, перед контактами** – partner-cta:

```html
<div class="fs-block" data-block="partner-cta" data-event="novogodnyaya-misteriya" data-variant="soft"></div>
```

**soundmystery.ru/newyear_fe** – партнёрской страницы больше нет: на ней только блок `redirect` с `data-to="/newyear"` (демо `newyear-fe.html`).

Заглушки («Заглушка: …») в `masters.json` и `content/masters/*.md` на сайт не выводятся: у мастера без описания – фото и имя, без «Подробнее». Расписание по часам пока скрыто: в Тильде скрыт старый блок программы (на одну ночь).

## Мини-лендинг в мессенджерах (m/)

Короткая версия страницы события на GitHub Pages – из тех же блоков и данных. Бот выдаёт на неё ссылки.

| Страница | Адрес | Что это |
|---|---|---|
| `m/newyear/` | https://xenaja.github.io/fest-sun-blocks/m/newyear/?ref=КОД | Новогодняя Мистерия для гостей |
| `m/partner/` | https://xenaja.github.io/fest-sun-blocks/m/partner/ | для партнёров, открывается из бота |

На странице один контейнер `<div class="fs-mini" data-event="…" data-page="main|partner">` и `fs.js`. Состав и порядок блоков – `event.json` → `mini.main.blocks` / `mini.partner.blocks` (поля блока = атрибуты `data-*`: `block`, `name`, `variant`, `cols`, `show`, `title`; `if` – показывать только при флаге в `shared/config.json`).

Где открыта страница и куда ведёт «Оставить заявку»:
- **Telegram Mini App** (в адресе `tgWebApp…`): грузится скрипт Telegram, цвета светлых секций – из темы Telegram, код партнёра – из `startapp`, заявка – родной кнопкой Telegram в чат бота.
- **ВК** (`?vk=1`), **MAX** (`?max=1`), **браузер** – закреплённая кнопка внизу; если в `shared/config.json` заданы `vk_club` / `max_bot` – выбор мессенджера, иначе сразу Telegram.
- Ссылки в бота: `e_newyear__s_mini__r_<код>`.

`shared/config.json`: `vk_club`, `max_bot` (пока null – кнопки ВК и MAX скрыты), `bridges` (VK Bridge / MAX), `api_url` (учёт открытий `POST /mini/open` – включать только после записи в политике ПД), `partner_club` (раздел «Клуб» на странице партнёров).

Новые блоки (работают и на сайте, в Тильду пока не ставим):
- `hero` – первый экран: `event.json` → `hero` (eyebrow, title, lead, dates, image).
- `video` – `event.json` → `video` (`rutube` | `youtube` | `vk`, `cover`, `title`); плеер грузится по нажатию, под ним ссылка на сайт видео.
- `gallery` – `data-name="rooms"` → `event.json` → `galleries.rooms` (title, caption, photos); листается пальцем. Если вместо фото `"rooms": true` – блок показывает номера центра из `shared/center.json` (как `rooms`); так у Новогодней Мистерии.
- `::: icons` в md – картинка, заголовок, строка: `- ![Подпись](img/icon.webp) **Заголовок** текст` (картинки – от папки события).
- `prices` с `data-cols="partner"` – только партнёрская колонка, `data-title` – свой заголовок.

Фото – в `events/<событие>/img/`, webp до 1200 px; ссылок на tildacdn нет.

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
  content/community.md         – «Сообщество» для всех лендингов: ::: new – на сайте, ::: partner («Клуб») – читает бот
  content/partner-cta.md       – «Вы партнёр Full Energy?» внизу лендинга (если у события нет своего)
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
Этого нет на сайте: текст для партнёров читает бот.
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

Так оформлен `about.md`. Первый абзац после заголовка всегда становится вводным; абзацы внутри `::: new` выделяются отдельно; `::: partner` на сайте не показывается.

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

Статус-бар – заголовок без капса и пункты в строку через точки, снизу тонкая линия (как `intro.md` Новогодней Мистерии):

```
::: bar
## Заголовок
- Пункт
- Пункт
:::
```

Абзац по центру:

```
::: center
Текст по центру.
:::
```

Тире в текстах – только среднее (–). Числа в ценах форматируются сами: `10000` в JSON → «10 000 ₽».

**Цену оргвзноса.** `events/<id>/event.json` → `fee.waves`: у каждой волны `partner` и `new`. `0` показывается как «В подарок». Подписи колонок – `fee.labels` (`new` – «Участие», `partner` – «Для партнёров Full Energy»), строки под колонками – `fee.new_note` и `fee.partner_note`.

**Текущую волну.** `fee.current_wave`: `1`, `2` или `3`. Прошедшие волны зачёркиваются, текущая отмечается «сейчас» – и в стоимости, и в спецпрограммах.

**Заголовок спецпрограмм.** `event.json` → `specials.title`: пустая строка `""` – блок без заголовка (когда заголовок уже стоит в Тильде).

**Плашку подарка, рассрочку, кнопку.** `fee.gift`, `fee.installment`, `fee.button`. Чтобы убрать плашку, удалите строку `gift`.

**Цены проживания.** `shared/center.json` → у номера `per_day`: цена за человека в сутки при 1/2/3/4 жильцах, `null` – так поселить нельзя. Цена в таблице = `per_day × длительность`. Если на какой-то срок цена особая, добавьте `"fixed": { "7": { "2": 30000 } }`.

**Длительности.** `event.json` → `durations`, например `[7, 10]` или `[7]`.

**Мастера.** Новый мастер – запись в `shared/masters.json` (+ фото в `shared/img/masters/` и текст `shared/content/masters/<id>.md`), затем его `id` в `masters` нужного `event.json`. Чтобы мастер не показывался на лендинге: `{ "id": "valeeva", "audience": "partner" }`. `pos` и `zoom` – кадрирование фото в кружке (в окне «Подробнее» фото целиком). Что мастер ведёт на конкретном событии – `events/<id>/content/masters/<мастер>.md`: дописывается в конец окна «Подробнее» только на этом событии.

**Спецпрограммы.** Список – `shared/specials.json`, какие и по какой цене у события – `event.json` → `specials.items` и `specials.prices` (по волнам). Особая цена у одной программы: `{ "id": "banya", "prices": [3000, 4000, 5000] }`.

**Бот.** `event.json` → `bot.telegram` и `bot.start` (`e_fest` у фестиваля, `e_masters` у Круга мастеров – как в `config/events.yaml` бота).

### Пункты с описанием по клику

```
::: accordion
- **Заголовок.** Описание – открывается по «+».
- **Ещё пункт** Описание.
:::
```

Видны только заголовки строками, описание раскрывается по нажатию. Сейчас так: программа Новогодней Мистерии, поток «Бизнес и успех» ЭС, «Что вас ждёт» в блоке сообщества (обе версии). Раздел `::: partner` в `community.md` не трогаем – его читает бот.

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
| `--fs-feature-title-case`, `--fs-feature-title-size`, `--fs-feature-title-spacing` | подзаголовки карточек `::: features` (капс, размер, разрядка) |
| `--fs-hero-bg`, `--fs-hero-overlay`, `--fs-hero-kicker-size`, `--fs-hero-kicker-color`, `--fs-hero-main-size` | первый экран: фон, затемнение картинки, размеры и цвет двух строк H1 |
| `--fs-radius`, `--fs-btn-radius`, `--fs-shadow` | скругления и тени |
| `--fs-font-head`, `--fs-font-body`, `--fs-head-weight` | шрифты (по умолчанию наследуются от Тильды) |
| `--fs-width`, `--fs-pad-y`, `--fs-pad-y-mobile` | ширина и отступы секций (ЭС: 90 / 60 px – как пресет 90 в Тильде) |
| `--fs-dark-edge`, `--fs-dark-edge-mobile` | фигурные края тёмных секций – высота клина к центру сверху и снизу (ЭС: 60 / 24 px; не задано – прямоугольник) |
| `--fs-soft-edge`, `--fs-soft-edge-mobile` | то же для серых секций (`data-variant="soft"`); по умолчанию края прямые |
| `--fs-dark-wave-top`, `--fs-dark-wave-bottom`, `--fs-soft-wave-*`, `--fs-dark-clip` | своя форма края вместо клина: SVG-маска (чёрное – видно) верхнего и нижнего края, тогда `--fs-dark-clip: none`. У soundmystery – звуковая волна, на телефоне реже. Край заходит на соседний блок, в вырезах виден он сам |

Фигурный край рядом с узким блоком Тильды (кнопка, короткий заголовок – ниже 220 px) скрипт делает прямым, иначе волна сверху и снизу узкой полосы – перебор. Вручную – атрибут `data-edge` у блока: `none` (без краёв), `top` / `bottom` (только верхний / нижний), `both` (оба, без автоматики).

## Надёжность

- Скрипт без зависимостей и сборки, стили вставляет сам, все классы с префиксом `fs-`.
- Если файл не загрузился или событие не найдено, блок скрывается, остальная страница работает. Причина пишется в консоль браузера с пометкой `[fest-sun-blocks]`.
- Адаптив от 320 px, без горизонтальной прокрутки страницы.

## Что пока заглушки

- Цены и номера в `shared/center.json`, фото номеров (`shared/img/rooms/placeholder-*.svg`).
- Даты «Энергии Солнца».
- Тексты: faq, route, описания спецпрограмм, тексты Юры Ра и Андрея Захаревича.
- [ ] **Спецпрограммы — добавить краткое описание** (`shared/specials.json` → `desc`): Ночь гонга, Мистерия звука, Банная церемония, Баня на берегу горной реки, Походы. Пока там «Заглушка: …», на сайте выводится только название.
- [ ] **О компании** (`shared/content/company.md`): 2–3 факта о Full Energy – год основания, число партнёров, рост. Только подтверждённые цифры – вписать абзацем после «…на большие планы».
- [ ] Маргарита Фулвари («У нас уже выступали») — 1–2 строки для «Подробнее» (`shared/content/masters/fulvari.md`) и регалии в `shared/masters.json`.
- «Круг мастеров»: иллюстрация первого экрана, цены (оргвзнос), вопросы события, тексты мастеров.

## Проверка локально

```
python -m http.server 8765
```

и открыть http://127.0.0.1:8765/index.html (с `file://` данные не загрузятся).
