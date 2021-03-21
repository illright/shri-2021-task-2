/** Участник команды */
interface TeamMember {
  /** ID участника */
  id: number;
  /** имя участника */
  name: string;
  /** имя файла с аватаркой участника */
  avatar: string;
  /** строка, содержит значение и единицы (необязательно), например строки и голоса */
  valueText: string;
}

/** Лидеры, алиас шаблона `leaders` */
export interface LeadersData {
  /** заголовок */
  title: string;
  /** подзаголовок, в нашем случае название спринта */
  subtitle: string;
  /** используется для акцентов в интерфейсе */
  emoji: string;
  /** необязательное, содержит ID выбранного участника, отображение результатов голосования */
  selectedUserId?: number;
  /** упорядоченный массив с участниками команды */
  users: TeamMember[];
}

/** Голосование, алиас шаблона `vote` */
export interface VoteData {
  /** заголовок */
  title: string;
  /** подзаголовок, в нашем случае название спринта */
  subtitle: string;
  /** используется для акцентов в интерфейсе */
  emoji: string;
  /** необязательное, содержит ID выбранного ранее участника */
  selectedUserId?: number;
  /** необязательное, индекс пользователя в массиве, которого нужно отобразить первым */
  offset?: number;
  /** упорядоченный массив с участниками голосования */
  users: TeamMember[];
}

interface Period {
  /** заголовок периода */
  title: string;
  /** название спринта */
  hint?: string;
  /** число, значение для периода */
  value: number;
  /** является ли элемент текущим */
  active?: boolean;
}

/** Статистика, алиас шаблона `chart` */
export interface ChartData {
  /** заголовок */
  title: string;
  /** подзаголовок, в нашем случае название спринта */
  subtitle: string;
  /** массив с участниками команды */
  users: TeamMember[];
  /** упорядоченный массив предыдущих, текущего и следующих периодов */
  values: Period[];
}

interface Category {
  /** заголовок категории */
  title: string;
  /** строка, содержит значение и единицы измерения */
  valueText: string;
  /** строка, значение разницы с предыдущим периодом и единицы по категории */
  differenceText: string;
}

/** Круговая диаграмма, алиас шаблона `diagram` */
export interface DiagramData {
  /** заголовок */
  title: string;
  /** подзаголовок, в нашем случае название спринта */
  subtitle: string;
  /** строка, содержит значение и единицы */
  totalText: string;
  /** строка, содержит разницу со значением предыдущего периода (спринта) и единицы */
  differenceText: string;
  /** упорядоченный массив предыдущих, текущего и следующих периодов */
  categories: Category[];
}

/** упорядоченный массив из 24 элементов, соответствуют часам */
type Activity = [number, number, number, number, number, number,
                 number, number, number, number, number, number,
                 number, number, number, number, number, number,
                 number, number, number, number, number, number];

/** Карта активности, алиас шаблона `activity` */
export interface ActivityData {
  /** заголовок */
  title: string;
  /** подзаголовок, в нашем случае название спринта */
  subtitle: string;
  /** данные по дням недели */
  data: {
    mon: Activity;
    tue: Activity;
    wed: Activity;
    thu: Activity;
    fri: Activity;
    sat: Activity;
    sun: Activity;
  }
}

interface LeadersSlide {
  alias: 'leaders';
  data: LeadersData;
}

interface VoteSlide {
  alias: 'vote';
  data: VoteData;
}

interface ChartSlide {
  alias: 'chart';
  data: ChartData;
}

interface DiagramSlide {
  alias: 'diagram';
  data: DiagramData;
}

interface ActivitySlide {
  alias: 'activity';
  data: ActivityData;
}

export type Slide = LeadersSlide | VoteSlide | ChartSlide | DiagramSlide | ActivitySlide;

declare module './data.json' {
  const value: Slide[];
  export default value;
}
