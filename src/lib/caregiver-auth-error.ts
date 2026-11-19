export type CaregiverAuthMode = "signin" | "signup" | "forgot" | "update";

type AuthFailure = { code?: string; status?: number; name?: string };

const CODE_MESSAGES: Record<string, string> = {
  email_not_confirmed: "Підтвердьте електронну пошту за посиланням із листа, потім увійдіть.",
  invalid_credentials: "Не вдалося увійти. Перевірте пошту й пароль.",
  user_already_exists: "Акаунт з цією поштою вже існує. Увійдіть або відновіть пароль.",
  email_exists: "Акаунт з цією поштою вже існує. Увійдіть або відновіть пароль.",
  weak_password: "Пароль має містити щонайменше 8 символів.",
  same_password: "Новий пароль має відрізнятися від старого.",
  email_address_invalid: "Перевірте адресу електронної пошти.",
  signup_disabled: "Створення акаунтів зараз вимкнено.",
  email_provider_disabled: "Вхід через електронну пошту тимчасово недоступний.",
  provider_disabled: "Вхід через електронну пошту тимчасово недоступний.",
  over_email_send_rate_limit: "Забагато листів або спроб. Спробуйте пізніше.",
  over_request_rate_limit: "Забагато листів або спроб. Спробуйте пізніше.",
  redirect_to_not_allowed: "Посилання для входу налаштоване неправильно. Спробуйте пізніше.",
  bad_redirect_uri: "Посилання для входу налаштоване неправильно. Спробуйте пізніше.",
  otp_expired: "Посилання прострочене або вже використане. Запросіть нове.",
  token_expired: "Посилання прострочене або вже використане. Запросіть нове.",
  invalid_token: "Посилання прострочене або вже використане. Запросіть нове.",
  flow_state_expired: "Посилання прострочене або вже використане. Запросіть нове.",
  flow_state_not_found: "Посилання прострочене або вже використане. Запросіть нове.",
  captcha_failed: "Перевірка безпеки не пройдена. Оновіть сторінку й спробуйте ще раз.",
  session_not_found: "Сесія завершилася. Увійдіть ще раз.",
  bad_jwt: "Сесія завершилася. Увійдіть ще раз.",
  refresh_token_not_found: "Сесія завершилася. Увійдіть ще раз.",
  reauthentication_needed: "Сесія завершилася. Увійдіть ще раз.",
};

/** Maps a Supabase Auth error to safe, actionable copy for the caregiver forms. */
export function caregiverAuthError(error: unknown, mode: CaregiverAuthMode): string {
  const failure = (error ?? {}) as AuthFailure;
  const code = typeof failure.code === "string" ? failure.code : "";
  const message = CODE_MESSAGES[code];
  if (message) return message;

  if (failure.status === 429) return "Забагато листів або спроб. Спробуйте пізніше.";
  if (failure.status === 0 || failure.name === "AuthRetryableFetchError") {
    return "Не вдалося з'єднатися. Перевірте інтернет і спробуйте ще раз.";
  }

  if (mode === "signin") return "Не вдалося увійти. Перевірте пошту й пароль.";
  if (mode === "update") {
    return "Не вдалося зберегти пароль. Відкрийте новий лист відновлення й спробуйте ще раз.";
  }
  return "Не вдалося завершити дію. Перевірте дані й спробуйте ще раз.";
}
