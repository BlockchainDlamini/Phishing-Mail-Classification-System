<template>
  <div class="phishing-detection min-h-screen">
    <Toast />

      <!-- Main Analysis Card -->
      <Card class="shadow-2xl border-0 border-round-2xl mb-6 overflow-hidden">
        <template #content>
          <div class="p-6">
            <!-- Upload Section -->
            <div class="text-center mb-6">
              <div class="inline-flex align-items-center justify-content-center w-16 h-16 border-circle mb-4">
                <i class="pi pi-cloud-upload text-blue-600 text-2xl"></i>
              </div>
              <h2 class="text-3xl font-semibold text-gray-800 mb-2">Upload Email for Analysis</h2>
              <p class="text-gray-600">Upload your .eml file to detect potential phishing threats</p>
            </div>

            <!-- File Upload Area -->
            <div class="upload-area border-2 border-dashed border-gray-300 border-round-lg p-4 sm:p-6 md:p-8 text-center mb-4 transition-all duration-300">
              <FileUpload
                  ref="fileUploader"
                  :maxFileSize="1000000"
                  accept=".eml"
                  :customUpload="true"
                  @uploader="processEmailFile"
                  class="w-full"
                  chooseLabel="Select Email File (.eml)"
                  :pt="{
                    root: { class: 'border-0 bg-transparent' },
                    buttonbar: { class: 'bg-transparent border-0 p-0' },
                    chooseButton: { 
                      class: 'bg-blue-600 hover:bg-blue-700 border-blue-600 px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-sm sm:text-base md:text-lg font-medium border-round-lg w-full sm:w-auto' 
                    }
                  }"
              >
                <template #empty>
                  <div class="text-center px-2">
                    <i class="pi pi-file text-2xl sm:text-3xl md:text-4xl text-gray-400 mb-2 sm:mb-3"></i>
                    <p class="text-gray-500 text-sm sm:text-base md:text-lg px-2 sm:px-4">
                      <span class="block sm:inline">Drag and drop your email file here,</span>
                      <span class="block sm:inline">or click to browse</span>
                    </p>
                  </div>
                </template>
              </FileUpload>
            </div>

            <!-- Processing Indicator -->
            <div v-if="isProcessing" class="text-center py-4">
              <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
              <p class="text-gray-600 mt-3 font-medium">Processing your email...</p>
            </div>

            <!-- Email Preview -->
            <div v-if="emailContent && !isProcessing" class="email-preview-card">
              <Card class="bg-gradient-to-r from-gray-50 to-gray-100 border-0 mb-4">
                <template #content>
                  <div class="p-4">
                    <div class="flex align-items-center mb-4">
                      <i class="pi pi-envelope text-blue-600 text-xl mr-3"></i>
                      <h3 class="text-xl font-semibold text-gray-800">Email Preview</h3>
                    </div>
                    <Divider class="my-3" />

                    <div class="grid gap-3">
                      <div v-if="emailPreview.subject" class="col-12">
                        <div class="p-3 border-round-lg shadow-sm">
                          <span class="font-semibold text-gray-700">Subject:</span>
                          <p class="mt-1 text-gray-900">{{ emailPreview.subject }}</p>
                        </div>
                      </div>

                      <div class="col-12 md:col-6">
                        <div v-if="emailPreview.from" class="p-3 border-round-lg shadow-sm h-full">
                          <span class="font-semibold text-gray-700">From:</span>
                          <p class="mt-1 text-gray-900 text-sm">{{ emailPreview.from }}</p>
                        </div>
                      </div>

                      <div class="col-12 md:col-6">
                        <div v-if="emailPreview.to" class="p-3 border-round-lg shadow-sm h-full">
                          <span class="font-semibold text-gray-700">To:</span>
                          <p class="mt-1 text-gray-900 text-sm">{{ emailPreview.to }}</p>
                        </div>
                      </div>

                      <div v-if="emailPreview.links && emailPreview.links.length > 0" class="col-12">
                        <div class="p-3 border-round-lg shadow-sm">
                          <span class="font-semibold text-gray-700">Links Found ({{ emailPreview.links.length }}):</span>
                          <div class="mt-2 max-h-20 overflow-auto">
                            <div v-for="(link, index) in emailPreview.links.slice(0, 3)" :key="index"
                                 class="text-sm text-blue-600 mb-1 break-all">
                              {{ link }}
                            </div>
                            <p v-if="emailPreview.links.length > 3" class="text-sm text-gray-500 mt-2">
                              ...and {{ emailPreview.links.length - 3 }} more links
                            </p>
                          </div>
                        </div>
                      </div>

                      <div v-if="emailPreview.bodyPreview" class="col-12">
                        <div class="p-3 border-round-lg shadow-sm">
                          <span class="font-semibold text-gray-700">Body Preview:</span>
                          <p class="mt-2 text-gray-800 text-sm line-height-3">{{ emailPreview.bodyPreview }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <!-- Analyze Button -->
            <div v-if="emailContent && !isProcessing" class="text-center">
              <Button
                  :disabled="isAnalyzing"
                  @click="analyzeEmail"
                  icon="pi pi-search"
                  label="Analyze for Phishing"
                  class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 px-8 py-4 text-lg font-semibold border-round-lg shadow-lg transform transition-all duration-200 hover:scale-105"
              />
            </div>

            <!-- Analysis Progress -->
            <div v-if="isAnalyzing" class="text-center py-6">
              <div class="inline-flex flex-column align-items-center">
                <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" />
                <p class="text-gray-700 mt-4 font-medium text-lg">Analyzing email for phishing indicators...</p>
                <p class="text-gray-500 text-sm mt-1">This may take a few moments</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Analysis Results -->
      <div v-if="analysisResult !== null" class="analysis-results mb-6">
        <Card class="shadow-2xl border-0 border-round-2xl overflow-hidden">
          <template #content>
            <div class="p-6">
              <!-- Phishing Detection Result -->
              <div v-if="analysisResult.label === 'phishing'"
                   class="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 border-round-xl">
                <div class="inline-flex align-items-center justify-content-center w-20 h-20 bg-red-100 border-circle mb-4">
                  <i class="pi pi-exclamation-triangle text-3xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-red-700 mb-3">Phishing Email Detected</h2>
                <div class="bg-white p-4 border-round-lg shadow-sm mb-4 inline-block">
                  <span class="text-2xl font-bold text-red-600">{{ (analysisResult.confidence * 100).toFixed(1) }}%</span>
                  <p class="text-gray-600 text-sm mt-1">Confidence Level</p>
                </div>
                <p class="text-gray-700 text-lg mb-6">This email has been identified as a potential phishing attempt.</p>

                <!-- Detection Features -->
                <div v-if="phishingFeatures.length > 0" class="text-left bg-white p-4 border-round-lg shadow-sm">
                  <h3 class="text-lg font-semibold text-gray-800 mb-3 flex align-items-center">
                    <i class="pi pi-info-circle text-blue-600 mr-2"></i>
                    Detection Indicators
                  </h3>
                  <ul class="list-none p-0">
                    <li v-for="(feature, index) in phishingFeatures" :key="index"
                        class="flex align-items-start mb-2 last:mb-0">
                      <i class="pi pi-check text-red-500 mr-2 mt-1 text-sm"></i>
                      <span class="text-gray-700">{{ feature }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Legitimate Email Result -->
              <div v-else class="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-round-xl">
                <div class="inline-flex align-items-center justify-content-center w-20 h-20 border-circle mb-4">
                  <i class="pi pi-check-circle text-3xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-green-700 mb-3">Email Appears Legitimate</h2>
                <div class="bg-white p-4 border-round-lg shadow-sm mb-4 inline-block">
                  <span class="text-2xl font-bold text-green-600">{{ (analysisResult.confidence * 100).toFixed(1) }}%</span>
                  <p class="text-gray-600 text-sm mt-1">Confidence Level</p>
                </div>
                <p class="text-gray-700 text-lg mb-4">This email appears to be legitimate based on our AI analysis.</p>

                <!-- Explainability -->
                <div class="bg-white p-4 border-round-lg shadow-sm text-left">
                  <h4 class="font-semibold text-gray-800 mb-2">Analysis Details</h4>
                  <p class="text-gray-600 text-sm">
                    The model classified this as "{{ analysisResult.label }}" with the highest probability
                    ({{ (analysisResult.probabilities[analysisResult.label] * 100).toFixed(2) }}%).
                  </p>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- How It Works Section -->
      <Card class="shadow-xl border-0 border-round-2xl mb-6">
        <template #content>
          <div class="p-6">
            <div class="text-center mb-6">
              <h2 class="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
              <p class="text-gray-600 text-lg">Our AI-powered system analyzes emails using advanced machine learning techniques</p>
            </div>

            <div class="grid">
              <div class="col-12 md:col-4 mb-4 md:mb-0">
                <div class="text-center p-4 h-full">
                  <div class="inline-flex align-items-center justify-content-center w-16 h-16 border-circle mb-4">
                    <i class="pi pi-upload text-blue-600 text-2xl"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3">1. Upload Email</h3>
                  <p class="text-gray-600">Upload your email file (.eml format) for comprehensive security analysis</p>
                </div>
              </div>

              <div class="col-12 md:col-4 mb-4 md:mb-0">
                <div class="text-center p-4 h-full">
                  <div class="inline-flex align-items-center justify-content-center w-16 h-16 border-circle mb-4">
                    <i class="pi pi-cog text-purple-600 text-2xl"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3">2. Feature Extraction</h3>
                  <p class="text-gray-600">Advanced algorithms extract key features from headers, content, and links</p>
                </div>
              </div>

              <div class="col-12 md:col-4">
                <div class="text-center p-4 h-full">
                  <div class="inline-flex align-items-center justify-content-center w-16 h-16 border-circle mb-4">
                    <i class="pi pi-shield text-green-600 text-2xl"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-3">3. AI Detection</h3>
                  <p class="text-gray-600">Machine learning models analyze patterns to identify phishing threats</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Features Section -->
      <Card class="shadow-xl border-0 border-round-2xl">
        <template #content>
          <div class="p-6">
            <div class="text-center mb-6">
              <h2 class="text-3xl font-bold text-gray-800 mb-3">Key Features</h2>
              <p class="text-gray-600 text-lg">Advanced security features to protect against phishing attacks</p>
            </div>

            <div class="grid">
              <div class="col-12 md:col-6 lg:col-3 mb-4">
                <div class="feature-card p-4 border-round-lg bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <i class="pi pi-eye text-blue-600 text-2xl mb-3"></i>
                  <h4 class="font-semibold text-gray-800 mb-2">Header Analysis</h4>
                  <p class="text-gray-600 text-sm">Detects suspicious sender information and reply-to mismatches</p>
                </div>
              </div>

              <div class="col-12 md:col-6 lg:col-3 mb-4">
                <div class="feature-card p-4 border-round-lg bg-gradient-to-br from-purple-50 to-purple-100 h-full">
                  <i class="pi pi-link text-purple-600 text-2xl mb-3"></i>
                  <h4 class="font-semibold text-gray-800 mb-2">Link Inspection</h4>
                  <p class="text-gray-600 text-sm">Analyzes URLs for malicious patterns and suspicious domains</p>
                </div>
              </div>

              <div class="col-12 md:col-6 lg:col-3 mb-4">
                <div class="feature-card p-4 border-round-lg bg-gradient-to-br from-green-50 to-green-100 h-full">
                  <i class="pi pi-search text-green-600 text-2xl mb-3"></i>
                  <h4 class="font-semibold text-gray-800 mb-2">Content Analysis</h4>
                  <p class="text-gray-600 text-sm">Examines email content for phishing language patterns</p>
                </div>
              </div>

              <div class="col-12 md:col-6 lg:col-3 mb-4">
                <div class="feature-card p-4 border-round-lg bg-gradient-to-br from-orange-50 to-orange-100 h-full">
                  <i class="pi pi-chart-bar text-orange-600 text-2xl mb-3"></i>
                  <h4 class="font-semibold text-gray-800 mb-2">Confidence Scoring</h4>
                  <p class="text-gray-600 text-sm">Provides confidence levels for accurate threat assessment</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

export default {
  name: 'PhishingDetection',
  setup() {
    const API_ENDPOINT = 'http://127.0.0.1:8000/phishing_api/v1/predict/';
    const toast = useToast();
    const fileUploader = ref(null);
    const emailContent = ref(null);
    const isProcessing = ref(false);
    const isAnalyzing = ref(false);
    const analysisResult = ref(null);
    const emailPreview = reactive({
      subject: '',
      from: '',
      to: '',
      links: [],
      bodyPreview: ''
    });

    const phishingFeatures = computed(() => {
      if (!analysisResult.value || analysisResult.value.label !== 'phishing') {
        return [];
      }

      const features = extractPhishingFeatures(emailContent.value);
      return generatePhishingFeaturesList(features);
    });

    const processEmailFile = async (event) => {
      console.log('Start upload...')
      isProcessing.value = true;
      const file = event.files[0];

      try {
        const text = await readFileContent(file);
        emailContent.value = text;

        extractEmailPreview(text);

        toast.add({
          severity: 'success',
          summary: 'Email Loaded Successfully',
          detail: 'Your email file has been processed and is ready for analysis',
          life: 3000
        });
      } catch (error) {
        console.error('Error processing email file:', error);
        toast.add({
          severity: 'error',
          summary: 'Processing Error',
          detail: 'Failed to process the email file. Please try again.',
          life: 5000
        });
      } finally {
        isProcessing.value = false;
        fileUploader.value.clear();
      }
    };

    const readFileContent = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    };

    const extractEmailPreview = (emailText) => {
      const subjectMatch = emailText.match(/Subject:(.*?)(?:\r?\n(?!\s)|\r?\n\r?\n)/s);
      if (subjectMatch) {
        emailPreview.subject = subjectMatch[1].trim();
      }

      const fromMatch = emailText.match(/From:(.*?)(?:\r?\n(?!\s)|\r?\n\r?\n)/s);
      if (fromMatch) {
        emailPreview.from = fromMatch[1].trim();
      }

      const toMatch = emailText.match(/To:(.*?)(?:\r?\n(?!\s)|\r?\n\r?\n)/s);
      if (toMatch) {
        emailPreview.to = toMatch[1].trim();
      }

      const urlRegex = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/g;
      const htmlHrefRegex = /href=["'](https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)["']/g;

      const bodyLinks = [];
      let urlMatch;

      while ((urlMatch = urlRegex.exec(emailText)) !== null) {
        bodyLinks.push(urlMatch[0]);
      }

      while ((urlMatch = htmlHrefRegex.exec(emailText)) !== null) {
        bodyLinks.push(urlMatch[1]);
      }

      emailPreview.links = [...new Set(bodyLinks)];

      const bodyStartIndex = emailText.indexOf('\r\n\r\n');
      if (bodyStartIndex !== -1) {
        const bodyText = emailText.substring(bodyStartIndex + 4);
        emailPreview.bodyPreview = bodyText.substring(0, 300) + (bodyText.length > 300 ? '...' : '');
      }
    };

    const analyzeEmail = async () => {
      if (!emailContent.value) {
        toast.add({
          severity: 'warn',
          summary: 'No Email Selected',
          detail: 'Please upload an email file first',
          life: 3000
        });
        return;
      }

      isAnalyzing.value = true;

      try {
        const truncatedEmail = truncateEmailForApi(emailContent.value);
        console.log('Truncated Email:', truncatedEmail)
        const response = await axios.post(API_ENDPOINT, {
          input_text: truncatedEmail
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response:', response.data);
        analysisResult.value = response.data;

        toast.add({
          severity: 'success',
          summary: 'Analysis Complete',
          detail: 'Email analysis has been completed successfully',
          life: 3000
        });
      } catch (error) {
        console.error('Error analyzing email:', error);

        let errorMessage = 'Failed to analyze the email';
        if (error.response) {
          console.error('Error response:', error.response.data);
          errorMessage = `Server error: ${error.response.status}`;
          if (error.response.data && error.response.data.details) {
            errorMessage += ` - ${error.response.data.details}`;
          }
        } else if (error.request) {
          errorMessage = 'No response from server. Please check if the API is running.';
        }

        toast.add({
          severity: 'error',
          summary: 'Analysis Error',
          detail: errorMessage,
          life: 5000
        });
      } finally {
        isAnalyzing.value = false;
      }
    };

    const truncateEmailForApi = (emailText) => {
      const headers = {};
      ['From', 'To', 'Subject', 'Reply-To'].forEach(header => {
        const regex = new RegExp(`${header}:(.*?)(?:\\r?\\n(?!\\s)|\\r?\\n\\r?\\n)`, 's');
        const match = emailText.match(regex);
        if (match) {
          headers[header] = match[1].trim();
        }
      });

      let body = '';
      const bodyStartIndex = emailText.indexOf('\r\n\r\n');
      if (bodyStartIndex !== -1) {
        body = emailText.substring(bodyStartIndex + 4).trim();
      }

      const truncatedBody = body.length > 300 ? body.substring(0, 300) + '...' : body;

      let truncatedEmail = '';
      if (headers['From']) truncatedEmail += `From: ${headers['From']}\n`;
      if (headers['To']) truncatedEmail += `To: ${headers['To']}\n`;
      if (headers['Subject']) truncatedEmail += `Subject: ${headers['Subject']}\n`;
      if (headers['Reply-To']) truncatedEmail += `Reply-To: ${headers['Reply-To']}\n`;
      truncatedEmail += `\n${truncatedBody}`;

      return truncatedEmail;
    };

    const extractPhishingFeatures = (emailText) => {
      return {
        headerFeatures: {
          hasReplyTo: /^Reply-To:/mi.test(emailText),
          subjectHasUrgent: /urgent|important|alert|verify|confirm|update|secure/i.test(emailPreview.subject),
          fromDomainMismatch: checkFromDomainMismatch(emailText),
        },
        hyperlinksFeatures: {
          numberOfLinks: emailPreview.links.length,
          hasMismatchedDisplayUrl: checkForMismatchedUrls(emailText),
          hasIPAddressUrl: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(emailText),
          urlLengthAvg: calculateAvgUrlLength(emailPreview.links),
        }
      };
    };

    const checkFromDomainMismatch = (emailText) => {
      const fromMatch = emailText.match(/From:.*?@([\w.-]+)/i);
      const replyToMatch = emailText.match(/Reply-To:.*?@([\w.-]+)/i);

      if (fromMatch && replyToMatch) {
        return fromMatch[1] !== replyToMatch[1];
      }
      return false;
    };

    const checkForMismatchedUrls = (emailText) => {
      const hrefRegex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
      let match;
      let hasMismatch = false;

      while ((match = hrefRegex.exec(emailText)) !== null) {
        const href = match[1];
        const displayText = match[2].replace(/<[^>]*>/g, '');

        if (displayText.includes('http') && !displayText.includes(href)) {
          hasMismatch = true;
          break;
        }
      }

      return hasMismatch;
    };

    const calculateAvgUrlLength = (urls) => {
      if (urls.length === 0) return 0;
      const totalLength = urls.reduce((sum, url) => sum + url.length, 0);
      return totalLength / urls.length;
    };

    const generatePhishingFeaturesList = (features) => {
      const featuresList = [];

      if (features.headerFeatures.hasReplyTo) {
        featuresList.push("Email contains Reply-To header that might redirect responses to a different address");
      }

      if (features.headerFeatures.subjectHasUrgent) {
        featuresList.push("Subject contains urgent or attention-grabbing language");
      }

      if (features.headerFeatures.fromDomainMismatch) {
        featuresList.push("From domain doesn't match Reply-To domain");
      }

      if (features.hyperlinksFeatures.numberOfLinks > 0) {
        featuresList.push(`Email contains ${features.hyperlinksFeatures.numberOfLinks} hyperlinks`);
      }

      if (features.hyperlinksFeatures.hasMismatchedDisplayUrl) {
        featuresList.push("Contains links where display text doesn't match actual destination");
      }

      if (features.hyperlinksFeatures.hasIPAddressUrl) {
        featuresList.push("Contains links using IP addresses instead of domain names");
      }

      if (features.hyperlinksFeatures.urlLengthAvg > 30) {
        featuresList.push("Contains unusually long URLs (average length: " +
            features.hyperlinksFeatures.urlLengthAvg.toFixed(1) + " characters)");
      }

      return featuresList;
    };

    return {
      fileUploader,
      emailContent,
      isProcessing,
      isAnalyzing,
      emailPreview,
      analysisResult,
      phishingFeatures,
      processEmailFile,
      analyzeEmail
    };
  }
};
</script>

<style>
.phishing-detection {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.container {
  max-width: 1200px;
}

.upload-area {
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.email-preview-card {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.analysis-results {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Mobile Optimizations */
@media screen and (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
  }

  .hero-section h1 {
    font-size: 2.5rem;
  }

  .hero-section p {
    font-size: 1.1rem;
  }

  .hero-section i {
    font-size: 3rem;
  }

  .container {
    margin-top: -2rem;
  }

  .upload-area {
    padding: 2rem 1rem;
  }

  .analysis-results h2 {
    font-size: 2rem;
  }

  .feature-card {
    margin-bottom: 1rem;
  }
}

@media screen and (max-width: 480px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-section p {
    font-size: 1rem;
  }

  .hero-section .flex {
    flex-direction: column;
    text-align: center;
  }

  .hero-section i {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .upload-area {
    padding: 1.5rem 0.5rem;
    min-height: 100px;
  }

  .email-preview-card .grid > div {
    padding: 0.5rem;
  }

  .analysis-results .inline-block {
    display: block !important;
    margin-bottom: 1rem;
  }
}

/* Custom PrimeVue overrides */
:deep(.p-card) {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-fileupload) {
  border: none;
  background: transparent;
}

:deep(.p-fileupload-buttonbar) {
  background: transparent;
  border: none;
  padding: 0;
  justify-content: center;
}

:deep(.p-fileupload-choose) {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
}

:deep(.p-fileupload-choose:hover) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.5);
}

:deep(.p-button) {
  transition: all 0.3s ease;
}

:deep(.p-button:hover) {
  transform: translateY(-1px);
}

:deep(.p-progressspinner-circle) {
  stroke: #3b82f6;
}

:deep(.p-toast) {
  z-index: 9999;
}

:deep(.p-toast .p-toast-message) {
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Loading states */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Pulse animation for loading states */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Enhanced focus states for accessibility */
:deep(.p-button:focus),
:deep(.p-fileupload-choose:focus) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .hero-section {
    background: #000;
    color: #fff;
  }

  .feature-card {
    border: 2px solid #333;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .upload-area,
  .feature-card,
  :deep(.p-button),
  .email-preview-card,
  .analysis-results {
    transition: none;
    animation: none;
  }

  .upload-area:hover,
  .feature-card:hover,
  :deep(.p-button:hover) {
    transform: none;
  }
}
</style>