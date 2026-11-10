<template>
  <section class="terms-page">
    <div class="terms-watermark" aria-hidden="true">
      <img :src="bubaLogo" alt="" />
    </div>

    <div class="section-header">
      <div>
        <p class="section-tag section-tag--muted">{{ t.sectionTag }}</p>
        <h2>{{ t.pageTitle }}</h2>
      </div>
    </div>

    <div class="terms-copy">
      <h3>{{ t.rulesTitle }}</h3>
      <ol class="rules-list">
        <li v-for="(rule, index) in rules" :key="`${rule}-${index}`">{{ rule }}</li>
      </ol>
      <p class="terms-ending">{{ t.ending }}</p>
    </div>

    <form class="membership-form" @submit.prevent="submitRequest">
      <div class="agreement-group">
        <p class="agreement-title">{{ t.agreementTitle }}</p>

        <label class="agreement-item" v-for="(item, index) in agreementItems" :key="`${item.label}-${index}`">
          <input v-model="agreements[item.key]" type="checkbox" />
          <span>{{ item.label }}</span>
        </label>
      </div>

      <div class="form-grid">
        <label>
          <span>{{ t.name }}</span>
          <input v-model="form.name" type="text" required />
        </label>

        <label>
          <span>{{ t.surname }}</span>
          <input v-model="form.surname" type="text" required />
        </label>

        <label>
          <span>{{ t.address }}</span>
          <input v-model="form.address" type="text" required />
        </label>

        <label>
          <span>{{ t.city }}</span>
          <input v-model="form.city" type="text" required />
        </label>

        <label>
          <span>{{ t.postalCode }}</span>
          <input v-model="form.postalCode" type="text" required />
        </label>

        <label>
          <span>{{ t.phone }}</span>
          <input v-model="form.phone" type="tel" required />
        </label>

        <label class="field--wide">
          <span>{{ t.email }}</span>
          <input v-model="form.email" type="email" required />
        </label>

        <label class="field--wide">
          <span>{{ t.vehicleDescription }}</span>
          <textarea v-model="form.vehicleDescription" rows="4" required></textarea>
        </label>

        <label class="field--wide">
          <span>{{ t.additionalInfo }}</span>
          <textarea v-model="form.additionalInfo" rows="3"></textarea>
        </label>
      </div>

      <div ref="captchaRef" class="join-captcha"></div>

      <p v-if="submitStatus === 'success'" class="join-form-message join-form-message--success" role="status">
        {{ t.success }}
      </p>
      <p v-if="submitStatus === 'error'" class="join-form-message join-form-message--error" role="alert">
        {{ errorMessage }}
      </p>

      <div class="form-actions">
        <button
          class="button button--primary"
          type="submit"
          :disabled="!allAgreed || isSubmitting || submitStatus === 'success'"
        >
          {{ isSubmitting ? t.sending : t.submitButton }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { currentLanguageCode } from '../services_and_configuratables/translations_state_change'
import bubaLogo from '../assets/icons/bubalogo.jpg'

const isMkd = computed(() => currentLanguageCode.value === 'mkd')

const mkdRules = [
  '“Буба Клуб Македонија” е здружение на граѓани, сопственици и љубители на автомобилот Фолксваген Буба.',
  'Член на клубот може да биде секој државјанин на Р. С. Македонија без разлика на етничка, верска и полова припадност.',
  'Здружението е непрофитабилна организација.',
  'Клубските обележја како маици со симболот на клубот, клубското знаме, капи, налепници на предното стакло и останатите реквизити кои го означуваат клубот задолжително мора да се носат на сите собири на клубот и на собири на кои клубот не може да гостува од страна на членовите кои сакаат индивидуално да гостуваат.',
  'Органите на управување ќе се избираат секоја 2 година.',
  'Здружението ќе работи според позитивните законски одредби на Република С. Македонија.',
  'Забранета е употреба на Клубот во политички, профитабилни и други цели кои се надвор од статутот и програмата на Клубот.',
  'Секакви јавно изречени изјави од членовите на Клубот ќе се сметаат за лични доколку истите не се писмено потврдени од највисокиот орган на Здружението.',
  'Сите членови плаќаат членарина, која важи една година од датумот на пристапувањето, односно плаќањето.',
  'Собраните средства од членарината ќе бидат користени за цели согласно претходно донесени акти од страна на Управниот одбор на Здружението.',
  'Доколку не се плати членарината се губи правото за членство во Клубот.',
  'Доколку членот не ги почитува општите услови на Здружението и работи спротивно на неговите интереси може да биде отповикан од натамошното членување во Клубот.',
  'За време на организирани паради и изложби на буба возила од Буба Клубот Македонија се забранува истакнување на верски, партиски и други симболи освен симболот на клубот или на спонзорот предходно договорено од страна на органите на клубот.',
  'Членската карта може да се користи во и вон државата само според одредбите и условите одредени од страна на органите на клубот.',
  'На собирите организирани од Буба Клуб Македонија учествуваат само членовите на клубот со своите возила на место одредено од клубот, сите останати кои не се членови своите возила ги паркираат на друго место.',
  'Се забранува дискриминација по основ на етничка, верска или полова припадност.',
]

const englishRules = [
  'Beetle Club Macedonia is an association of citizens, owners, and enthusiasts of the Volkswagen Beetle.',
  'Any citizen of the Republic of North Macedonia may join the club regardless of ethnicity, religion, or gender.',
  'The association is non-profit.',
  'Club insignia such as T-shirts with the club symbol, club flags, caps, windshield stickers, and other accessories that mark the club must be worn at all club gatherings and at gatherings where the club cannot attend individually.',
  'The governing bodies are elected every 2 years.',
  'The association operates in accordance with the positive legal provisions of the Republic of North Macedonia.',
  'Use of the club for political, profit-driven, or any other objectives outside the statute and program of the club is prohibited.',
  'Any public statements made by club members will be considered personal unless confirmed in writing by the highest organ of the association.',
  'All members pay a membership fee that is valid for one year from the date of admission or payment.',
  'Funds collected from membership fees will be used for purposes established by decisions of the Management Board.',
  'Failure to pay the membership fee results in loss of club membership rights.',
  'If a member does not respect the general conditions of the association and acts against its interests, they may be expelled from further membership.',
  'During organized parades and exhibitions of Beetle vehicles by Beetle Club Macedonia, religious, party, or other symbols are prohibited except the club symbol or a sponsor symbol previously agreed by club authorities.',
  'Membership cards may be used within and outside the country only according to the rules and conditions set by the club authorities.',
  'At gatherings organized by Beetle Club Macedonia, only club members may participate with their vehicles in the designated club area; all others must park their vehicles elsewhere.',
  'Discrimination on the basis of ethnicity, religion, or gender is prohibited.',
]

const rules = computed(() => (isMkd.value ? mkdRules : englishRules))

const agreementDefaults = {
  general: false,
  membership: false,
  respect: false,
  conduct: false,
}

const agreements = reactive({ ...agreementDefaults })

const agreementItems = computed(() => {
  const labels = isMkd.value
    ? [
        'Се согласувам дека ги прочитав и ги прифаќам сите горенаведени правила.',
        'Се согласувам дека членарината и условите на клубот се важечки за мене.',
        'Се согласувам да ги почитувам интересите, обврските и редот на клубот.',
        'Се согласувам дека моето членство може да биде прекинато ако ги нарушам правилата.',
      ]
    : [
        'I agree that I have read and accept all the rules listed above.',
        'I agree that membership fees and club conditions apply to me.',
        'I agree to respect the interests, responsibilities, and order of the club.',
        'I agree that my membership may be terminated if I violate the rules.',
      ]

  return [
    { key: 'general', label: labels[0] },
    { key: 'membership', label: labels[1] },
    { key: 'respect', label: labels[2] },
    { key: 'conduct', label: labels[3] },
  ]
})

const form = reactive({
  name: '',
  surname: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
  vehicleDescription: '',
  additionalInfo: '',
})

const allAgreed = computed(() => Object.values(agreements).every(Boolean))

const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const isSubmitting = ref(false)
const errorMessage = ref('')
const captchaRef = ref<HTMLElement | null>(null)
const captchaToken = ref('')
let captchaWidgetId: string | undefined
let turnstileScript: Promise<TurnstileApi> | null = null

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id?: string) => void
}

const loadTurnstile = () => {
  turnstileScript ??= new Promise<TurnstileApi>((resolve, reject) => {
    const existing = (window as unknown as { turnstile?: TurnstileApi }).turnstile
    if (existing) {
      resolve(existing)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve((window as unknown as { turnstile: TurnstileApi }).turnstile)
    script.onerror = () => {
      turnstileScript = null
      reject(new Error('Could not load Turnstile'))
    }
    document.head.appendChild(script)
  })

  return turnstileScript
}

const removeCaptcha = () => {
  if (captchaWidgetId !== undefined) {
    ;(window as unknown as { turnstile?: TurnstileApi }).turnstile?.remove(captchaWidgetId)
    captchaWidgetId = undefined
  }
  captchaToken.value = ''
}

const renderCaptcha = async () => {
  captchaToken.value = ''

  if (!captchaRef.value) {
    return
  }

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  if (!siteKey) {
    return
  }

  try {
    const turnstile = await loadTurnstile()
    if (!captchaRef.value) {
      return
    }

    captchaWidgetId = turnstile.render(captchaRef.value, {
      sitekey: siteKey,
      theme: 'light',
      language: currentLanguageCode.value === 'mkd' ? 'mk' : 'en',
      callback: (token: string) => {
        captchaToken.value = token
      },
      'expired-callback': () => {
        captchaToken.value = ''
      },
      'error-callback': () => {
        captchaToken.value = ''
      },
    })
  } catch (error) {
    console.error(error)
  }
}

watch(
  () => currentLanguageCode.value,
  async () => {
    removeCaptcha()
    await renderCaptcha()
  },
)

onMounted(() => {
  void renderCaptcha()
})

onBeforeUnmount(() => {
  removeCaptcha()
})

const t = computed(() => {
  if (isMkd.value) {
    return {
      sectionTag: 'Terms and Rules',
      pageTitle: 'Општи правила и услови за членство',
      rulesTitle: 'Општи Правила',
      ending: 'Ова се општите правила на Буба Клуб Македонија. Секоја негова копирање или користење во други цели е забрането.',
      agreementTitle: 'Потврдувам дека:',
      name: 'Име',
      surname: 'Презиме',
      address: 'Адреса',
      city: 'Град',
      postalCode: 'Поштенски број',
      phone: 'Телефон / Работа / Мобилен',
      email: 'Е-маил',
      vehicleDescription: 'Краток опис на возилото - модел, година на производство, боја и слично',
      additionalInfo: 'Додатни информации',
      submitButton: 'Испрати барање за членство',
      sending: 'Се испраќа...',
      success: 'Ви благодариме! Вашето барање е успешно испратено.',
      captchaRequired: 'Ве молиме завршете ја верификацијата пред да испратите.',
      captchaFailed: 'Верификацијата не успеа. Обидете се повторно.',
      error: 'Настана грешка. Барањето не е испратено, обидете се повторно.',
    }
  }

  return {
    sectionTag: 'Terms and Rules',
    pageTitle: 'General rules and membership conditions',
    rulesTitle: 'General rules',
    ending: 'These are the general rules of Beetle Club Macedonia. Any copying or use for other purposes is prohibited.',
    agreementTitle: 'I confirm that:',
    name: 'Name',
    surname: 'Surname',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal code',
    phone: 'Phone / Work / Mobile',
    email: 'Email',
    vehicleDescription: 'Brief description of the vehicle - model, year of manufacture, color and similar',
    additionalInfo: 'Additional information',
    submitButton: 'Send request for membership',
    sending: 'Sending...',
    success: 'Thank you! Your request has been sent successfully.',
    captchaRequired: 'Please complete the verification before sending.',
    captchaFailed: 'Verification failed. Please try again.',
    error: 'Something went wrong. Your request was not sent, please try again.',
  }
})

const submitRequest = async () => {
  if (!allAgreed.value || isSubmitting.value) {
    return
  }

  if (!captchaToken.value) {
    errorMessage.value = t.value.captchaRequired
    submitStatus.value = 'error'
    return
  }

  isSubmitting.value = true
  submitStatus.value = 'idle'
  errorMessage.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        surname: form.surname,
        email: form.email,
        description: [
          `Address: ${form.address}`,
          `City: ${form.city}`,
          `Postal code: ${form.postalCode}`,
          `Phone: ${form.phone}`,
          `Vehicle: ${form.vehicleDescription}`,
          `Additional info: ${form.additionalInfo || '-'}`,
        ].join('\n'),
        captchaToken: captchaToken.value,
      }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      const isCaptchaFailure = response.status === 403 || data?.error === 'Captcha failed'
      errorMessage.value = isCaptchaFailure ? t.value.captchaFailed : data?.error || t.value.error
      submitStatus.value = 'error'
      return
    }

    submitStatus.value = 'success'
    form.name = ''
    form.surname = ''
    form.address = ''
    form.city = ''
    form.postalCode = ''
    form.phone = ''
    form.email = ''
    form.vehicleDescription = ''
    form.additionalInfo = ''
    removeCaptcha()
    await renderCaptcha()
  } catch (error) {
    console.error(error)
    errorMessage.value = t.value.error
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.terms-page {
  position: relative;
  display: grid;
  gap: 1.6rem;
  padding: clamp(2rem, 4vw, 3rem);
  min-height: clamp(34rem, 72vh, 50rem);
  margin-bottom: clamp(2.5rem, 6vw, 5rem);
  border-radius: 1.3rem;
  border: 1px solid rgba(122, 32, 32, 0.1);
  background: #f9f1e7;
  overflow: hidden;
  isolation: isolate;
}

.terms-watermark {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
}

.terms-watermark img {
  width: min(72vw, 42rem);
  max-width: 100%;
  filter: grayscale(0.2) brightness(0.6);
}

.section-header,
.terms-copy,
.membership-form {
  position: relative;
  z-index: 1;
}

.section-tag {
  margin: 0 0 0.8rem;
  font-size: 0.72rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #e7bf5f;
  font-weight: 700;
}

.section-tag--muted {
  color: #7d1e1e;
}

.section-header h2 {
  margin: 0;
  color: #1a1c22;
  font-size: clamp(2rem, 3.2vw, 3rem);
  line-height: 1.05;
}

.terms-copy {
  display: grid;
  gap: 1rem;
}

.terms-copy h3 {
  margin: 0;
  color: #1a1c22;
  font-size: 1.7rem;
}

.rules-list {
  margin: 0;
  padding-left: 1.4rem;
  display: grid;
  gap: 0.7rem;
  line-height: 1.8;
  color: #3b3f47;
}

.rules-list li::marker {
  color: #7d1e1e;
  font-weight: 700;
}

.terms-ending {
  margin: 0;
  color: #2a2c31;
  line-height: 1.7;
  font-weight: 600;
  border-top: 1px solid rgba(35, 30, 26, 0.12);
  padding-top: 0.8rem;
}

.membership-form {
  display: grid;
  gap: 1.4rem;
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(122, 32, 32, 0.1);
  border-radius: 1.1rem;
  padding: 1.2rem;
}

.agreement-group {
  display: grid;
  gap: 0.8rem;
}

.agreement-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1c22;
}

.agreement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  color: #292d34;
  line-height: 1.6;
  cursor: pointer;
}

.agreement-item input {
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.23rem;
  accent-color: #7d1e1e;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-grid label {
  display: grid;
  gap: 0.45rem;
  color: #1f2329;
  font-weight: 600;
}

.form-grid label span {
  color: #1a1c22;
}

.form-grid input,
.form-grid textarea {
  width: 100%;
  border: 1px solid rgba(35, 30, 26, 0.18);
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.75);
  padding: 0.8rem 0.9rem;
  font: inherit;
  color: #1f2329;
  resize: vertical;
}

.form-grid textarea {
  min-height: 6rem;
}

.field--wide {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

.button {
  appearance: none;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: transform 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
}

.button--primary {
  background: linear-gradient(135deg, #7d1e1e 0%, #b84b2a 100%);
  color: #fff;
  padding: 0.9rem 1.5rem;
  box-shadow: 0 12px 25px rgba(125, 30, 30, 0.18);
}

.button--primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.button:not(:disabled):hover {
  transform: translateY(-1px);
}

@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
