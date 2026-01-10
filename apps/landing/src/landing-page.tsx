import {
  Mail,
  LayoutGrid,
  Plug,
  FileText,
  RefreshCw,
  Users,
  Code,
  Github,
  ExternalLink,
  ChevronRight,
  Check,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero />
      <Features />
      <Providers />
      <HowItWorks />
      <QuickStart />
      <FAQ />
      <Footer />
    </div>
  );
}

function Nav({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Canary</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#providers"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Providers
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it Works
            </a>
            <a
              href="https://github.com/your-org/canary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/your-org/canary"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
            >
              Get Started
            </a>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-gray-600">
                Features
              </a>
              <a href="#providers" className="text-sm text-gray-600">
                Providers
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600">
                How it Works
              </a>
              <a href="https://github.com/your-org/canary" className="text-sm text-gray-600">
                Docs
              </a>
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-700 rounded-lg text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            Open Source & Self-Hosted
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Email template designer
            <span className="block text-primary-600">for developers</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Design beautiful emails visually, connect any provider, send via API. Self-hosted,
            open-source, and completely free.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/login"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Get Started Free
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/your-org/canary"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-gray-400">Canary Email Designer</span>
            </div>
            <div className="flex">
              <div className="w-48 bg-gray-800 p-4 border-r border-gray-700 hidden sm:block">
                <div className="space-y-2">
                  {['Heading', 'Text', 'Button', 'Image', 'Divider', 'Columns'].map((block) => (
                    <div
                      key={block}
                      className="px-3 py-2 bg-gray-700 rounded text-sm text-gray-300"
                    >
                      {block}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-8 bg-gray-100 min-h-[300px]">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 space-y-4">
                  <div className="h-8 w-32 bg-primary-100 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-10 w-32 bg-primary-600 rounded" />
                </div>
              </div>
              <div className="w-64 bg-white p-4 border-l border-gray-200 hidden lg:block">
                <div className="text-xs text-gray-500 uppercase mb-3">Properties</div>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-100 rounded" />
                  <div className="h-8 bg-gray-100 rounded" />
                  <div className="h-8 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: LayoutGrid,
      title: 'Visual Drag & Drop Editor',
      description:
        'Design emails without writing HTML. 10+ block types, nested layouts, real-time preview.',
      color: 'bg-violet-100 text-violet-600',
    },
    {
      icon: Plug,
      title: 'Multiple Email Providers',
      description: 'Connect SendGrid, Resend, Mailgun, AWS SES, Postmark, or any SMTP server.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: FileText,
      title: 'PDF Attachments',
      description:
        'Generate PDF versions of your emails automatically. Perfect for invoices and receipts.',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: RefreshCw,
      title: 'Background Processing',
      description:
        'Reliable delivery with async job queue. Automatic retries with exponential backoff.',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'OAuth login, role-based access, multiple teams. Built for organizations.',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: Code,
      title: 'Developer API',
      description:
        'Full REST API with webhooks. Send emails programmatically with simple API calls.',
      color: 'bg-cyan-100 text-cyan-600',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything you need for email
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From visual design to reliable delivery, Canary provides the complete toolkit for your
            email infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Providers() {
  const providers = [
    { name: 'SendGrid', color: 'bg-blue-500' },
    { name: 'Resend', color: 'bg-gray-900' },
    { name: 'Mailgun', color: 'bg-red-500' },
    { name: 'Amazon SES', color: 'bg-orange-500' },
    { name: 'Postmark', color: 'bg-yellow-500' },
    { name: 'SMTP', color: 'bg-gray-500' },
  ];

  return (
    <section id="providers" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Connect your email provider
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Canary works with the providers you already use. Switch anytime without changing your
            templates.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
            >
              <div
                className={`w-12 h-12 ${provider.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}
              >
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-gray-900">{provider.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Design Your Template',
      description:
        'Use the visual editor to create stunning emails. Drag blocks, customize styles, add dynamic variables.',
    },
    {
      step: '02',
      title: 'Configure Provider',
      description:
        'Connect your email service with API keys. Set default sender, test the connection.',
    },
    {
      step: '03',
      title: 'Send via API',
      description:
        'Integrate with one API call. Pass variables for personalization, track delivery status.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How it works</h2>
          <p className="mt-4 text-lg text-gray-600">Three steps to beautiful, reliable emails</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-gray-100 mb-4">{step.step}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
          <div className="text-sm text-gray-400 mb-2">Send email with template</div>
          <pre className="text-sm text-gray-300 font-mono">
            {`curl -X POST https://your-domain.com/api/v1/send \\
  -H "X-API-Key: cnry_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "welcome-email",
    "to": "user@example.com",
    "variables": {
      "name": "John",
      "company": "Acme Inc"
    }
  }'`}
          </pre>
        </div>
      </div>
    </section>
  );
}

function QuickStart() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Deploy in 2 minutes</h2>
          <p className="mt-4 text-lg text-gray-600">Self-host with Docker Compose</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">docker-compose.yml</span>
            <button className="text-sm text-primary-400 hover:text-primary-300">Copy</button>
          </div>
          <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
            {`# Clone the repository
git clone https://github.com/your-org/canary.git
cd canary

# Start all services
docker compose up -d

# Open http://localhost:3000`}
          </pre>
        </div>

        <div className="text-center mt-8">
          <a
            href="https://github.com/your-org/canary#quick-start-development"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
          >
            View full installation guide
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      question: 'Is Canary really free?',
      answer:
        'Yes! Canary is open-source under the MIT license. Self-host it on your own infrastructure at no cost.',
    },
    {
      question: 'Can I use my existing email provider?',
      answer:
        'Canary supports SendGrid, Resend, Mailgun, Amazon SES, Postmark, and any generic SMTP server.',
    },
    {
      question: 'Does it support dynamic content?',
      answer:
        'Yes. Use Handlebars variables in your templates for personalization. Includes helpers for formatting dates, currency, and more.',
    },
    {
      question: 'Can my team collaborate?',
      answer:
        'Yes. Canary includes role-based access control with owner, admin, and member roles. Support for multiple teams per user.',
    },
    {
      question: 'Is there an API for sending emails?',
      answer:
        'Full REST API with API key authentication. Send emails, manage templates, and receive webhook events for delivery status.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                {faq.question}
              </h3>
              <p className="text-gray-600 ml-8">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Canary</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/your-org/canary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Documentation
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              API Reference
            </a>
          </div>

          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Canary. MIT License.
          </div>
        </div>
      </div>
    </footer>
  );
}
