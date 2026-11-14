import { tr } from "@/lib/i18n";
import type { Lang } from "@/lib/store";

/** App-written, device-only fallback. No generated or child-authored content is stored. */
export function readyStory(lang: Lang) {
  return {
    title: tr("Пригода насінини", lang),
    scenes: [
      "Маленька насінина соняшника сиділа в теплій квітці й боялася вітру.",
      "«Куди він мене понесе?» — думала вона. Але одного ранку вітер таки підхопив її.",
      "Було страшно й весело водночас. Насінина летіла над полем, над хатками й лелеками.",
      "Нарешті вона опустилася в м’яку землю. Там було темно й тихо, і вона трохи поплакала.",
    ].map((text) => ({ text: tr(text, lang) })),
    closing: tr(
      "А навесні з неї виріс новий соняшник. Сміливість — це не відсутність страху, а крок уперед разом із ним.",
      lang,
    ),
  };
}
