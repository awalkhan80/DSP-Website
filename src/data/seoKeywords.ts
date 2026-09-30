export interface KeywordCategory {
  primary: string[];
  secondary: string[];
  commercialIntent: string[];
  aeoPrompts: string[];
  russianYandex: string[];
}

export const SEO_KEYWORDS: Record<string, KeywordCategory> = {
  desertSafari: {
    primary: [
      "desert safari dubai",
      "dubai desert safari price",
      "dubai evening safari",
      "desert safari dubai rates",
      "desert safari dubai online booking",
      "evening desert safari dubai",
      "best desert safari in dubai"
    ],
    secondary: [
      "evening desert safari rates",
      "lahbab red dunes safari",
      "desert safari with bbq dinner",
      "cheap desert safari dubai",
      "vip desert safari dubai",
      "desert safari private car pickup",
      "camel ride and sandboarding dubai"
    ],
    commercialIntent: [
      "book desert safari dubai online",
      "cheapest desert safari ticket dubai",
      "desert safari dubai offers and deals",
      "family desert safari packages dubai",
      "luxury vip desert safari booking"
    ],
    aeoPrompts: [
      "how much does a desert safari cost in dubai",
      "what is the price of dubai desert safari",
      "which is the best desert safari in dubai",
      "what to wear for dubai desert safari",
      "is food and water included in dubai desert safari",
      "what time does evening desert safari start in dubai"
    ],
    russianYandex: [
      "сафари в пустыне дубай",
      "вечернее сафари в дубае",
      "экскурсия в пустыню дубай цена",
      "сафари на джипах дубай отзывы",
      "джип сафари дубай цены билеты"
    ]
  },
  duneBuggyQuad: {
    primary: [
      "desert safari with quad bike",
      "desert safari buggy dubai",
      "dune buggy dubai",
      "quad bike dubai rental",
      "can-am buggy desert dubai",
      "polaris rzr desert tour"
    ],
    secondary: [
      "self drive dune buggy dubai",
      "quad biking for beginners dubai",
      "desert buggy tour with transfers",
      "1000cc dune buggy dubai price",
      "quad bike with desert safari combo"
    ],
    commercialIntent: [
      "rent dune buggy dubai desert",
      "quad bike rental price dubai",
      "book can am maverick buggy dubai",
      "atv desert safari booking dubai"
    ],
    aeoPrompts: [
      "can you drive a dune buggy in dubai without a driving license",
      "how old do you have to be to ride a quad bike in dubai",
      "how fast do dubai dune buggies go",
      "is safety equipment provided for quad biking in dubai"
    ],
    russianYandex: [
      "аренда багги в дубае",
      "квадроциклы в дубае пустыня",
      "катание на багги по барханам дубай",
      "багги сафари дубай цена"
    ]
  },
  abuDhabiFerrariWorld: {
    primary: [
      "abu dhabi tour with ferrari world",
      "abu dhabi city tour with ferrari world",
      "abu dhabi city tour with ferrari world cost",
      "ferrari world tickets from dubai"
    ],
    secondary: [
      "abu dhabi day trip with ferrari world entry",
      "sheikh zayed mosque and ferrari world tour",
      "abu dhabi combo tour from dubai",
      "ferrari world formula rossa tour"
    ],
    commercialIntent: [
      "book abu dhabi tour with ferrari world tickets",
      "cheapest abu dhabi ferrari world package",
      "abu dhabi full day sightseeing with theme park"
    ],
    aeoPrompts: [
      "how much does an abu dhabi tour with ferrari world cost",
      "can you do abu dhabi city tour and ferrari world in one day",
      "what is included in abu dhabi tour from dubai",
      "is hotel pickup included for abu dhabi ferrari world tour"
    ],
    russianYandex: [
      "экскурсия в абу-даби с феррари ворлд",
      "тур в абу даби из дубая феррари парк",
      "билеты феррари ворлд с трансфером из дубая"
    ]
  }
};
