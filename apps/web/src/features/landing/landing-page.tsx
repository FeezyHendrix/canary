import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Plug,
  FileText,
  RefreshCw,
  Users,
  Code,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Mail,
  Zap,
  Check,
} from 'lucide-react';

// ============================================================================
// Navigation
// ============================================================================
function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:pt-5">
      <nav className="mx-auto max-w-6xl flex items-center justify-between rounded-2xl border border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur-xl shadow-sm">
        <Link to="/landing" className="flex items-center">
          <img src="/assets/logo.svg" alt="Canary" className="h-7" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#providers"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Providers
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            How it Works
          </a>
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors inline-flex items-center gap-1"
          >
            Docs
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/20"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Link>
      </nav>
    </header>
  );
}

// ============================================================================
// Hero Section
// ============================================================================
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-violet-100/80 via-violet-50/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-60 left-0 w-[300px] h-[300px] bg-gradient-to-br from-rose-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 mb-8">
            <Zap className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Open Source</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 mb-6">
            Open-source email
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              template designer
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed">
            Design beautiful emails visually, connect any provider, send via API.
            <br className="hidden sm:block" />
            Self-hosted and free.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/30 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/your-org/canary"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-base font-medium text-zinc-900 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:-translate-y-0.5"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* Editor Preview Mockup */}
        <div className="mt-16 md:mt-24 relative">
          {/* Glow effect behind the mockup */}
          <div className="absolute inset-0 bg-gradient-to-t from-violet-500/10 via-transparent to-transparent rounded-3xl blur-2xl" />

          {/* Main mockup container */}
          <div className="relative rounded-2xl border border-zinc-200/80 bg-white shadow-2xl shadow-zinc-900/10 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-lg bg-white border border-zinc-200 px-4 py-1 text-xs text-zinc-400">
                  canary.app/templates/welcome-email
                </div>
              </div>
            </div>

            {/* Editor interface mockup */}
            <div className="flex h-[400px] md:h-[500px]">
              {/* Sidebar - Block types */}
              <div className="hidden md:flex w-64 flex-col border-r border-zinc-100 bg-zinc-50/50 p-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Blocks
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Heading', 'Text', 'Button', 'Image', 'Divider', 'Columns'].map((block) => (
                    <div
                      key={block}
                      className="rounded-lg border border-zinc-200 bg-white p-3 text-center text-xs font-medium text-zinc-600 hover:border-violet-300 hover:bg-violet-50 transition-colors cursor-pointer"
                    >
                      {block}
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-200">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Properties
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-white border border-zinc-200 p-2 text-xs text-zinc-500">
                      Font Size: 16px
                    </div>
                    <div className="rounded-lg bg-white border border-zinc-200 p-2 text-xs text-zinc-500">
                      Color: #1a1a1a
                    </div>
                  </div>
                </div>
              </div>

              {/* Main canvas */}
              <div className="flex-1 bg-zinc-100/50 p-6 md:p-10 overflow-hidden">
                <div className="mx-auto max-w-md bg-white rounded-lg shadow-lg border border-zinc-200 p-6 md:p-8">
                  {/* Email preview content */}
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-6">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-6 w-3/4 rounded bg-gradient-to-r from-zinc-200 to-zinc-100" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-zinc-100" />
                      <div className="h-3 w-5/6 rounded bg-zinc-100" />
                      <div className="h-3 w-4/6 rounded bg-zinc-100" />
                    </div>
                    <div className="pt-4">
                      <div className="inline-block rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-md">
                        Verify Email
                      </div>
                    </div>
                    <div className="border-t border-zinc-100 pt-4 mt-4">
                      <div className="h-2 w-1/2 rounded bg-zinc-100" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel - preview toggle */}
              <div className="hidden lg:flex w-48 flex-col border-l border-zinc-100 bg-zinc-50/50 p-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Preview
                </div>
                <div className="flex rounded-lg bg-zinc-200/50 p-1 mb-4">
                  <button className="flex-1 rounded-md bg-white text-xs font-medium text-zinc-700 py-1.5 shadow-sm">
                    Desktop
                  </button>
                  <button className="flex-1 rounded-md text-xs font-medium text-zinc-500 py-1.5">
                    Mobile
                  </button>
                </div>
                <div className="text-xs text-zinc-500 mb-2">Variables</div>
                <div className="space-y-1.5 text-xs">
                  <div className="rounded bg-white border border-zinc-200 px-2 py-1.5 font-mono text-zinc-600">
                    {'{{name}}'}
                  </div>
                  <div className="rounded bg-white border border-zinc-200 px-2 py-1.5 font-mono text-zinc-600">
                    {'{{company}}'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-5 w-5 text-zinc-400" />
      </div>
    </section>
  );
}

// ============================================================================
// Features Section
// ============================================================================
const features = [
  {
    icon: LayoutGrid,
    title: 'Visual Drag & Drop Editor',
    description:
      'Design emails without writing HTML. 10+ block types, nested layouts, real-time preview.',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    icon: Plug,
    title: 'Multiple Email Providers',
    description: 'Connect SendGrid, Resend, Mailgun, AWS SES, Postmark, or any SMTP server.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: FileText,
    title: 'PDF Attachments',
    description:
      'Generate PDF versions of your emails automatically. Perfect for invoices and receipts.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: RefreshCw,
    title: 'Background Processing',
    description:
      'Reliable delivery with async job queue. Automatic retries with exponential backoff.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'OAuth login, role-based access, multiple teams. Built for organizations.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Code,
    title: 'Developer API',
    description: 'Full REST API with webhooks. Send emails programmatically with simple API calls.',
    gradient: 'from-cyan-500 to-cyan-600',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 mb-6 shadow-sm">
            <span className="text-sm font-medium text-zinc-600">Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            Everything you need
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600">
            From visual design to reliable delivery, Canary handles your complete email workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-zinc-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-5`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{feature.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Providers Section
// ============================================================================
const providers = [
  { name: 'SendGrid', color: 'from-blue-500 to-blue-600' },
  { name: 'Resend', color: 'from-zinc-800 to-zinc-900' },
  { name: 'Mailgun', color: 'from-red-500 to-red-600' },
  { name: 'Amazon SES', color: 'from-amber-500 to-orange-500' },
  { name: 'Postmark', color: 'from-yellow-500 to-amber-500' },
  { name: 'SMTP', color: 'from-emerald-500 to-emerald-600' },
];

function ProvidersSection() {
  return (
    <section id="providers" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 mb-6">
            <span className="text-sm font-medium text-zinc-600">Integrations</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            Connect Your Email Provider
          </h2>
          <p className="mx-auto max-w-xl text-lg text-zinc-600">
            Canary works with the providers you already use. Switch anytime without changing your
            templates.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="group relative rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:border-zinc-300"
            >
              <div
                className={`mx-auto h-14 w-14 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center shadow-lg mb-4`}
              >
                <Mail className="h-7 w-7 text-white" />
              </div>
              <div className="font-medium text-zinc-900">{provider.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// How It Works Section
// ============================================================================
const steps = [
  {
    number: '01',
    title: 'Design Your Template',
    description:
      'Use the visual editor to create stunning emails. Drag blocks, customize styles, add variables.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    number: '02',
    title: 'Configure Your Provider',
    description:
      'Connect your email service. Add API keys, set default sender, test the connection.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '03',
    title: 'Send via API',
    description: 'Integrate with one API call. Use template variables for personalization.',
    color: 'from-emerald-500 to-emerald-600',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 mb-6 shadow-sm">
            <span className="text-sm font-medium text-zinc-600">Workflow</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-lg text-zinc-600">
            From design to delivery in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-zinc-300 to-zinc-200" />
              )}

              <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-6`}
                >
                  <span className="text-xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-3">{step.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* API Example */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-4 text-sm text-zinc-400">Example API Call</span>
          </div>
          <pre className="text-sm md:text-base text-zinc-300 overflow-x-auto">
            <code>{`curl -X POST https://api.canary.app/v1/send \\
  -H "X-API-Key: cnry_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "welcome-email",
    "to": "user@example.com",
    "variables": {
      "name": "John",
      "company": "Acme Inc"
    }
  }'`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Quick Start Section
// ============================================================================
function QuickStartSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-violet-50 to-white p-8 md:p-12 lg:p-16 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 mb-6 shadow-sm">
            <span className="text-sm font-medium text-violet-600">Quick Start</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            Deploy in 2 Minutes
          </h2>
          <p className="mx-auto max-w-xl text-lg text-zinc-600 mb-10">
            Get Canary running locally with Docker Compose. Full stack included.
          </p>

          {/* Docker command */}
          <div className="mx-auto max-w-2xl rounded-xl border border-zinc-200 bg-zinc-900 p-4 md:p-6 shadow-lg mb-8">
            <pre className="text-sm md:text-base text-zinc-300 text-left overflow-x-auto">
              <code>
                <span className="text-zinc-500"># Clone and start</span>
                {'\n'}
                git clone https://github.com/your-org/canary.git{'\n'}
                cd canary{'\n'}
                docker compose up -d
              </code>
            </pre>
          </div>

          <a
            href="/docs/guides/quickstart"
            className="inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700 transition-colors"
          >
            Read the full documentation
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ Section
// ============================================================================
const faqs = [
  {
    question: 'Is Canary really free?',
    answer:
      'Yes! Canary is open-source under the MIT license. Self-host it on your own infrastructure at no cost. No usage limits, no hidden fees.',
  },
  {
    question: 'Can I use my own email provider?',
    answer:
      'Absolutely. Canary supports 6 major providers (SendGrid, Resend, Mailgun, AWS SES, Postmark) plus any SMTP server. Switch providers anytime without changing your templates.',
  },
  {
    question: 'Does it support dynamic content?',
    answer:
      'Yes! Use Handlebars variables like {{name}} and {{company}} in your templates. Pass values when sending via API for personalized emails.',
  },
  {
    question: 'Can my team collaborate?',
    answer:
      'Yes. Canary includes OAuth login (Google, GitHub), role-based access control, and support for multiple teams. Perfect for organizations of any size.',
  },
  {
    question: 'Is there an API?',
    answer:
      'Yes. Full REST API with OpenAPI documentation. API key authentication, webhook support for email events, and comprehensive email logs for delivery tracking.',
  },
  {
    question: 'How does PDF generation work?',
    answer:
      'Canary uses Gotenberg to convert your email templates to PDF. Perfect for invoices, receipts, and documents. Just enable the PDF option when sending.',
  },
];

function FAQSection() {
  return (
    <section className="py-24 bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 mb-6 shadow-sm">
            <span className="text-sm font-medium text-zinc-600">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-zinc-900 mb-2 flex items-start gap-3">
                <Check className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                {faq.question}
              </h3>
              <p className="text-zinc-600 leading-relaxed pl-8">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Footer
// ============================================================================
function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/assets/logo.svg" alt="Canary" className="h-7" />
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a
              href="https://github.com/your-org/canary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Documentation
            </a>
            <a
              href="/docs/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              API Reference
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Canary. MIT License.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// Main Landing Page Component
// ============================================================================
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProvidersSection />
        <HowItWorksSection />
        <QuickStartSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
