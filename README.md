# Задание 2. Данные для Stories

Это решение [тестового задания 2](https://github.com/yndx-shri/shri-2021-task-2) в Школу разработки интерфейсов, Яндекс, 2021.

В данном репозитории находится код генерации данных для слайдов Stories из неупорядоченного потока сущностей.

## Запуск

Для запуска может использоваться любой пакетный менеджер, но в репозитории присутствует лок-файл для [`pnpm`](https://pnpm.js.org/).

Сначала установите зависимости:

```bash
pnpm install
```

Соберите приложение с функцией `prepareData()` (результат будет лежать в папке `build/`):

```bash
pnpm build
```

Запустите автотесты:

```bash
pnpm test
```

## Как это работает

Так как данных с бэкенда, скорее всего, будет много (~30 МБ JSON'а только в примере), основным приоритетом было минимизировать количество прохождений по потоку данных и, как следствие, максимизировать количество выполненной работы за каждый проход. Данный алгоритм делает один полный проход по данным для группировки сущностей в удобные структуры данных (без копирования, поэтому расход памяти не такой существенный), а затем два неполных прохода – по всем комментариям и по всем коммитам.

### Архитектура

Код структурирован следующим образом:

* `src/`
  * `slide-builders/` – на каждый тип слайда отдельный файл-конструктор
  * `utils/` – вспомогательные функции
  * `main.ts` – функция `prepareData()`

Основная задача функции `prepareData` – сгруппировать данные в общие структуры данных, которые будут использованы несколькими функциями из `slide-builders/`. Структуры данных, используемые только одним конструктором, создаются прямо в нем.

Алгоритмическая сложность решения по времени – `O(n log n)`.

## Выбор инструментов

* [`TypeScript`](https://www.typescriptlang.org/) – делает редактор кода намного умнее, помогает отлавливать большое количество ошибок на этапе написания кода, позволяет использовать самый новый синтаксис JS и не волноваться о настройке Babel.

* [`pnpm`](https://pnpm.js.org/) – намного более быстрая и удобная альтернатива `npm`. В отличие от `yarn`, не позволяет папке `node_modules/` раздуваться. Думаю, не стоит объяснять, почему это хорошо :)

* [`Jest`](https://jestjs.io/) – удобная библиотека автотестирования с приятной документацией и хорошей интеграцией с TypeScript.

* [`Rollup`](https://rollupjs.org/guide/en/) – проверенный и функциональный сборщик. Из приемуществ: более адекватно выглядит файл конфигурации, а также вывод в консоль спокойнее, без шума, как у Webpack.
