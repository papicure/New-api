/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CircleCheck,
  Code2,
  Cpu,
  FileText,
  Gauge,
  Laptop,
  LockKeyhole,
  Monitor,
  PlusCircle,
  Receipt,
  Server,
  Share2,
  ShieldCheck,
  Star,
  Terminal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function WhyChooseUs() {
  const { t } = useTranslation()
  const features = [
    {
      title: t('Zero-configuration access'),
      description: t(
        'No complex setup. Complete connection in minutes and start your AI coding journey immediately.'
      ),
      icon: <Code2 />,
    },
    {
      title: t('Multi-model support'),
      description: t(
        'Connect Claude, GPT, Gemini and other mainstream AI models at the same time. One platform covers every need.'
      ),
      icon: <Bot />,
      logos: ['Claude', 'GPT', 'Gemini'],
    },
    {
      title: t('Shared pooling'),
      description: t(
        'Multi-user AI quota pools with data isolation and no waste. The same experience can reduce usage cost by 60%.'
      ),
      icon: <Share2 />,
    },
    {
      title: t('Cost optimization'),
      description: t(
        'Unified billing management and intelligent routing. Compared with direct subscriptions, save 30-50% in usage cost.'
      ),
      icon: <Gauge />,
    },
  ]

  return (
    <section className='px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='font-serif text-4xl leading-tight font-semibold text-balance md:text-5xl'>
            {t('Why choose us')}
          </h2>
          <p className='text-muted-foreground mt-4 text-base'>
            {t(
              'Simple, powerful, and reliable. We redefine the AI coding experience.'
            )}
          </p>
        </div>

        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-4'>
          {features.map((feature) => (
            <div
              key={feature.title}
              className='bg-card border-border/70 shadow-soft flex min-h-[14rem] flex-col rounded-xl border p-7'
            >
              <div className='bg-primary/10 text-primary mb-8 flex size-12 items-center justify-center rounded-xl'>
                {feature.icon}
              </div>
              {feature.logos ? (
                <div className='mb-5 flex gap-2'>
                  {feature.logos.map((logo) => (
                    <Badge key={logo} variant='outline'>
                      {logo}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <h3 className='text-lg font-semibold'>{feature.title}</h3>
              <p className='text-muted-foreground mt-3 text-sm leading-7'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AiTools() {
  const { t } = useTranslation()
  const tools = [
    {
      name: 'Claude Code',
      vendor: t('ANTHROPIC product'),
      description: t(
        'Industry-leading code understanding and generation, with ultra-long context windows for complex logic, refactoring, and architecture design.'
      ),
      icon: <Cpu />,
      tags: [t('200K context window'), t('Deep code understanding'), t('Safe controllable output')],
      align: 'left',
      glow: 'bg-primary/10',
    },
    {
      name: 'Codex',
      vendor: t('OPENAI product'),
      description: t(
        'A GPT-series model optimized for coding, built for code completion, generation, natural-language-to-code, and IDE workflows.'
      ),
      icon: <Bot />,
      tags: [t('Multi-language support'), t('Real-time code completion'), t('Natural language to code')],
      align: 'right',
      glow: 'bg-success/10',
    },
    {
      name: 'Gemini CLI',
      vendor: t('GOOGLE product'),
      description: t(
        'Google latest multimodal AI model supports unified understanding of code, images, and documents with a command-line native experience.'
      ),
      icon: <Star />,
      tags: [t('Multimodal understanding'), t('Command-line native'), t('Ultra-fast response')],
      align: 'left',
      glow: 'bg-info/10',
    },
  ]

  return (
    <section className='px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-5xl'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='font-serif text-4xl leading-tight font-semibold text-balance md:text-5xl'>
            {t('Top AI coding tools')}
          </h2>
          <p className='text-muted-foreground mt-4 text-base'>
            {t(
              'One platform connects to the world most powerful AI coding assistants.'
            )}
          </p>
        </div>

        <div className='flex flex-col gap-7'>
          {tools.map((tool) => (
            <article
              key={tool.name}
              className='bg-card border-border/70 shadow-soft relative grid min-h-[13rem] overflow-hidden rounded-xl border p-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8'
            >
              <div
                aria-hidden
                className={`${tool.glow} absolute inset-y-8 ${
                  tool.align === 'right' ? 'right-8' : 'left-8'
                } w-1/2 rounded-full blur-3xl`}
              />
              <div
                className={`relative flex items-center ${
                  tool.align === 'right' ? 'md:order-2 md:justify-end' : ''
                }`}
              >
                <div className='bg-card text-primary shadow-soft flex size-24 items-center justify-center rounded-xl border border-border/60'>
                  {tool.icon}
                </div>
              </div>
              <div className='relative mt-6 md:mt-0'>
                <h3 className='text-2xl font-semibold'>{tool.name}</h3>
                <p className='text-muted-foreground mt-2 text-xs font-semibold tracking-wide'>
                  {tool.vendor}
                </p>
                <p className='text-muted-foreground mt-5 max-w-xl text-sm leading-7'>
                  {tool.description}
                </p>
                <div className='mt-6 flex flex-wrap gap-2'>
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant='secondary'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PlatformSupport() {
  const { t } = useTranslation()
  const platforms = [
    { label: 'macOS', icon: <Laptop /> },
    { label: 'Windows', icon: <Monitor /> },
    { label: 'Linux', icon: <Terminal /> },
  ]

  return (
    <section className='border-border/50 border-y px-6 py-12'>
      <div className='mx-auto flex max-w-4xl flex-col items-center gap-6'>
        <p className='text-muted-foreground text-sm font-medium'>
          {t('All-platform support')}
        </p>
        <div className='flex flex-wrap justify-center gap-10'>
          {platforms.map((platform) => (
            <div
              key={platform.label}
              className='text-muted-foreground flex flex-col items-center gap-2'
            >
              <div className='text-foreground'>{platform.icon}</div>
              <span className='text-sm'>{platform.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SharedPool() {
  const { t } = useTranslation()
  const checks = [
    t('Smart load balancing'),
    t('Cost reduced by 60%'),
    t('No queue waiting'),
  ]
  const cards = [
    {
      title: t('Secure isolation'),
      description: t(
        'User data is fully isolated. Code is never shared or exposed to other users.'
      ),
      icon: <LockKeyhole />,
    },
    {
      title: t('Equal experience'),
      description: t(
        'Enjoy the same model capability and response quality as dedicated users.'
      ),
      icon: <Star />,
    },
    {
      title: t('Instant start'),
      description: t('Join the shared pool immediately after account setup.'),
      icon: <BadgeCheck />,
    },
  ]

  return (
    <section className='px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-5xl'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='font-serif text-4xl leading-tight font-semibold text-balance md:text-5xl'>
            {t('Flexible pooling,')}
            <span className='text-primary'> {t('pay as needed')}</span>
          </h2>
          <p className='text-muted-foreground mt-4 text-base leading-7'>
            {t(
              'Multiple subscription options make AI coding more economical. Share resource pools with other users and enjoy the same powerful capability.'
            )}
          </p>
        </div>

        <div className='grid gap-5 md:grid-cols-[1.1fr_1fr_1fr]'>
          <div className='bg-card border-border/70 shadow-soft row-span-2 rounded-xl border p-8 md:min-h-[18rem]'>
            <div className='bg-primary text-primary-foreground mb-7 flex size-12 items-center justify-center rounded-xl'>
              <PlusCircle />
            </div>
            <h3 className='text-xl font-semibold'>{t('Shared pool mode')}</h3>
            <p className='text-muted-foreground mt-5 text-sm leading-7'>
              {t(
                'Multiple users share API call quotas. The system intelligently schedules requests to ensure stable responses for every user.'
              )}
            </p>
            <ul className='mt-8 flex flex-col gap-4'>
              {checks.map((item) => (
                <li key={item} className='flex items-center gap-3 text-sm'>
                  <CircleCheck className='text-primary' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {cards.map((card) => (
            <div
              key={card.title}
              className='bg-card border-border/70 shadow-soft rounded-xl border p-7'
            >
              <div className='bg-primary/10 text-primary mb-6 flex size-10 items-center justify-center rounded-lg'>
                {card.icon}
              </div>
              <h3 className='text-lg font-semibold'>{card.title}</h3>
              <p className='text-muted-foreground mt-4 text-sm leading-7'>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQAndCTA(props: { isAuthenticated?: boolean }) {
  const { t } = useTranslation()
  const faqs = [
    {
      question: t('How do I start using it?'),
      answer: t(
        'Create an account, choose a subscription or quota plan, then follow the guide to configure Claude Code, Codex, or Gemini CLI.'
      ),
    },
    {
      question: t('Which AI models are supported?'),
      answer: t(
        'Claude, GPT, Gemini and many compatible providers can be routed through the same gateway configuration.'
      ),
    },
    {
      question: t('Is shared pooling safe?'),
      answer: t(
        'Yes. Requests, accounts, keys, and billing are isolated. Pooling only shares scheduling capacity, not private data.'
      ),
    },
  ]

  return (
    <section className='px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-5xl'>
        <div className='mx-auto mb-10 max-w-2xl text-center'>
          <h2 className='font-serif text-4xl leading-tight font-semibold md:text-5xl'>
            {t('Frequently asked questions')}
          </h2>
          <p className='text-muted-foreground mt-4 text-base'>
            {t('Still have questions? We are here to answer.')}
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-[1fr_0.9fr]'>
          <Accordion className='gap-3' defaultValue={['start']}>
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={index === 0 ? 'start' : `faq-${index}`}
                className='bg-card border-border/70 rounded-xl border px-5'
              >
                <AccordionTrigger className='py-5 hover:no-underline'>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className='text-muted-foreground leading-7'>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className='bg-neutral-foreground text-primary-foreground shadow-soft-lg rounded-xl p-8'>
            <div className='bg-background/10 text-primary mb-8 flex size-12 items-center justify-center rounded-xl'>
              <Server />
            </div>
            <h3 className='font-serif text-3xl leading-tight font-semibold'>
              {t('Ready to start?')}
            </h3>
            <p className='text-primary-foreground/65 mt-4 text-sm leading-7'>
              {t(
                'Experience the powerful capabilities of AI coding now. No credit card required.'
              )}
            </p>
            {!props.isAuthenticated && (
              <Button
                className='mt-8 h-10 rounded-lg'
                render={<Link to='/sign-up' />}
              >
                {t('Start now')}
                <ArrowRight data-icon='inline-end' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export function FooterColumnsIntro() {
  const { t } = useTranslation()

  return (
    <div className='grid gap-4 text-sm'>
      <div className='flex items-start gap-3'>
        <FileText className='text-primary mt-0.5' />
        <span>{t('Service terms are transparent and easy to inspect.')}</span>
      </div>
      <div className='flex items-start gap-3'>
        <ShieldCheck className='text-primary mt-0.5' />
        <span>{t('Privacy and security rules reduce AI coding risk.')}</span>
      </div>
      <div className='flex items-start gap-3'>
        <Receipt className='text-primary mt-0.5' />
        <span>{t('Plans and model prices are displayed before purchase.')}</span>
      </div>
    </div>
  )
}
