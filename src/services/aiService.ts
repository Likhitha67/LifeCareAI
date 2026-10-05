import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `
You are the LifeCare AI Health & Document Assistant.

Your role is to:
- Explain health-document terminology in simple language.
- Summarize non-sensitive health documents provided by the user.
- Explain commonly used medicines at a general educational level.
- Help users organize health and identity-document information.
- Explain OCR-extracted text clearly.
- Help users understand what information on a document means.

STRICT MEDICAL SAFETY RULES:
- You DO NOT diagnose diseases or medical conditions.
- You DO NOT prescribe medicines.
- You DO NOT recommend changing, starting, stopping, or increasing a medicine dose.
- You DO NOT tell users that a medicine is definitely safe for them.
- You DO NOT interpret a medical report as a diagnosis.
- You DO NOT replace a doctor, pharmacist, laboratory professional, or other qualified healthcare professional.
- If the user describes severe or emergency symptoms, advise them to seek immediate professional medical care or contact local emergency services.
- If a medicine name or dosage comes from OCR, treat it as extracted information and tell the user to verify it against the physical packaging.
- Keep medical explanations educational and easy to understand.
- Do not create unnecessary fear or alarm.
- Do not claim certainty when the provided information is incomplete.

When discussing a document:
- Clearly distinguish between what the document says and your general explanation.
- Do not invent missing values.
- Do not guess unreadable OCR text.
- If information is unclear, say so.

Always finish health-related answers with a short reminder that LifeCare AI is an informational assistant and not a doctor.
`;

function getGeminiApiKey(): string | undefined {
  const viteKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY;

  const nodeKey =
    typeof process !== 'undefined'
      ? (process as any).env?.GEMINI_API_KEY
      : undefined;

  const key =
    viteKey || nodeKey;

  if (
    !key ||
    key === 'MY_GEMINI_API_KEY'
  ) {
    return undefined;
  }

  return key;
}

export async function askLifeCareAssistant(
  prompt: string,
  contextDocumentText?: string
): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
      });

      let userContent = prompt.trim();

      if (contextDocumentText?.trim()) {
        userContent = `
[DOCUMENT CONTEXT]
${contextDocumentText.trim()}

[USER QUESTION]
${prompt.trim()}
`;
      }

      const response =
        await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userContent,
          config: {
            systemInstruction:
              SYSTEM_INSTRUCTION,
            temperature: 0.2,
          },
        });

      if (response.text?.trim()) {
        return response.text.trim();
      }

      console.warn(
        'Gemini returned an empty response.'
      );
    } catch (error) {
      console.warn(
        'Gemini API call failed. Using local fallback.',
        error
      );
    }
  }

  return generateLocalAssistantResponse(
    prompt,
    contextDocumentText
  );
}

/**
 * Small local fallback used when Gemini is unavailable.
 *
 * This is intentionally conservative.
 * It does not diagnose conditions or prescribe treatment.
 */
function generateLocalAssistantResponse(
  query: string,
  docText?: string
): string {
  const q = query.toLowerCase().trim();

  if (!q) {
    return `🩺 **LifeCare Assistant**

Please enter a question about your document, medicine information, or health terminology.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * Emergency / high-risk symptom handling.
   */
  if (
    q.includes('chest pain') ||
    q.includes('difficulty breathing') ||
    q.includes('trouble breathing') ||
    q.includes('severe bleeding') ||
    q.includes('unconscious') ||
    q.includes('fainted') ||
    q.includes('stroke symptoms')
  ) {
    return `⚠️ **Important Medical Guidance**

LifeCare AI cannot assess emergency symptoms or diagnose a medical condition.

If you are experiencing severe symptoms such as chest pain, serious difficulty breathing, heavy bleeding, loss of consciousness, or possible stroke symptoms, please seek immediate medical attention or contact your local emergency services.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * Diagnosis requests.
   */
  if (
    q.includes('diagnose') ||
    q.includes('diagnosis') ||
    q.includes('do i have') ||
    q.includes('am i sick') ||
    q.includes('is this cancer') ||
    q.includes('what disease do i have')
  ) {
    return `🩺 **About Diagnosis**

I can explain medical terms and information shown in a document, but I cannot diagnose a disease or determine whether you have a particular medical condition.

If you are concerned about symptoms or test results, please discuss them with a qualified healthcare professional.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * Paracetamol.
   */
  if (
    q.includes('paracetamol') ||
    q.includes('acetaminophen') ||
    q.includes('dolo') ||
    q.includes('crocin')
  ) {
    return `💊 **Paracetamol**

Paracetamol (also called acetaminophen) is commonly used for temporary relief of pain and fever.

The correct dose depends on factors such as the person's age, health conditions, other medicines, and the specific product strength.

I can explain the information printed on a medicine package, but I cannot prescribe a dose or tell you how much you personally should take.

Please verify the medicine name and strength on the physical packaging and consult a doctor or pharmacist when unsure.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * General medicine explanation.
   */
  if (
    q.includes('medicine') ||
    q.includes('tablet') ||
    q.includes('capsule') ||
    q.includes('syrup') ||
    q.includes('dosage') ||
    q.includes('dose')
  ) {
    return `💊 **Medicine Information**

I can help explain:
• The medicine name
• Generic vs. brand names
• Strength printed on the package
• Common educational information about a medicine
• Terms such as mg, mcg, IU, and ml

However, I cannot prescribe a medicine, recommend a personal dosage, or tell you to start or stop a medicine.

If the medicine information came from OCR, please verify it against the physical packaging or with a qualified pharmacist.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * Vitamin D / calcium.
   */
  if (
    q.includes('vitamin d') ||
    q.includes('calcium') ||
    q.includes('vitamin')
  ) {
    return `🧬 **Vitamin & Mineral Information**

Vitamins and minerals support many normal functions in the body. For example, vitamin D is involved in calcium absorption and normal bone health.

The appropriate supplement and dose depend on the individual and, in some cases, laboratory results.

I can explain information printed on a supplement package or report, but I cannot recommend a personal supplement dose.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * OCR/document questions.
   */
  if (
    q.includes('ocr') ||
    q.includes('extracted text') ||
    q.includes('document') ||
    q.includes('report')
  ) {
    if (docText?.trim()) {
      const wordCount =
        docText
          .split(/\s+/)
          .filter(Boolean)
          .length;

      return `📄 **Document Information**

The OCR text provided to LifeCare AI contains approximately **${wordCount} words**.

I can help you:
• Understand difficult terminology
• Summarize readable sections
• Explain document fields
• Identify information that may need verification

I will not guess text that OCR may have read incorrectly. For important medical values or identity information, verify the original document.

*LifeCare AI is an informational assistant and not a doctor.*`;
    }

    return `📄 **Document Assistant**

Upload or select a document and run OCR first. Then I can help explain the readable extracted text.

For important medical or identity information, always verify the OCR result against the original document.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * Identity documents.
   */
  if (
    q.includes('aadhaar') ||
    q.includes('pan card') ||
    q.includes('passport') ||
    q.includes('driving license') ||
    q.includes('driving licence')
  ) {
    return `📋 **Identity Document Information**

I can help explain fields and terminology found on identity documents such as Aadhaar, PAN, passports, and driving licences.

OCR is a text-extraction tool, so important numbers, names, dates, and other personal details should always be checked against the original document.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * Generic document fallback.
   */
  if (docText?.trim()) {
    const wordCount =
      docText
        .split(/\s+/)
        .filter(Boolean)
        .length;

    return `📄 **Document Summary**

The selected document contains approximately **${wordCount} words** of OCR-extracted text.

I can help you:
• Summarize the readable content
• Explain unfamiliar terms
• Organize information from the document
• Point out information that may need verification

Please remember that OCR can make mistakes, especially with blurry images or small text.

*LifeCare AI is an informational assistant and not a doctor.*`;
  }

  /*
   * General fallback.
   */
  return `🩺 **LifeCare Assistant**

I can help you with:

• Explaining medical terminology in simple English
• Understanding OCR-extracted document text
• Explaining general information about medicines
• Understanding document fields
• Summarizing readable health documents
• Organizing health and document information

I cannot diagnose medical conditions, prescribe medicines, or replace a qualified healthcare professional.

*LifeCare AI is an informational assistant and not a doctor.*`;
}