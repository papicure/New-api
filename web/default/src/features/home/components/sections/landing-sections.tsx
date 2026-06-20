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
  Code2,
  Gauge,
  Laptop,
  LockKeyhole,
  Monitor,
  PlusCircle,
  Server,
  Share2,
  Star,
  Terminal,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

function SectionHeader(props: {
  eyebrow: string
  title: ReactNode
  description: string
}) {
  return (
    <AnimateInView className='mx-auto mb-12 max-w-2xl text-center'>
      <p className='text-primary mb-3 font-mono text-xs font-semibold'>
        // {props.eyebrow}
      </p>
      <h2 className='font-serif text-4xl leading-tight font-semibold text-balance md:text-5xl'>
        {props.title}
      </h2>
      <p className='text-muted-foreground mt-4 text-base leading-7 text-pretty'>
        {props.description}
      </p>
    </AnimateInView>
  )
}

function BrandLogo(props: { name: string; size?: number }) {
  return (
    <span className='border-border/60 bg-background/70 shadow-soft flex size-10 items-center justify-center rounded-lg border'>
      {getLobeIcon(props.name, props.size ?? 26)}
    </span>
  )
}

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
      icon: <Server />,
      logos: ['Claude.Color', 'OpenAI.Color', 'Gemini.Color'],
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
        <SectionHeader
          eyebrow={t('why-newapi')}
          title={t('Why choose us')}
          description={t(
            'Simple, powerful, and reliable. We redefine the AI coding experience.'
          )}
        />

        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-4'>
          {features.map((feature, index) => (
            <AnimateInView
              key={feature.title}
              delay={index * 80}
              className='h-full'
            >
              <Card className='min-h-[14rem] p-7'>
                <div className='bg-primary/10 text-primary mb-8 flex size-12 items-center justify-center rounded-xl transition-transform duration-150 group-hover/card:scale-105'>
                  {feature.icon}
                </div>
                {feature.logos ? (
                  <div className='mb-5 flex gap-2'>
                    {feature.logos.map((logo) => (
                      <BrandLogo key={logo} name={logo} size={22} />
                    ))}
                  </div>
                ) : null}
                <h3 className='text-lg font-semibold'>{feature.title}</h3>
                <p className='text-muted-foreground mt-3 text-sm leading-7'>
                  {feature.description}
                </p>
              </Card>
            </AnimateInView>
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
      icon: 'Claude.Color',
      tags: [
        t('200K context window'),
        t('Deep code understanding'),
        t('Safe controllable output'),
      ],
      align: 'left',
      glow: 'bg-primary/10',
    },
    {
      name: 'Codex',
      vendor: t('OPENAI product'),
      description: t(
        'A GPT-series model optimized for coding, built for code completion, generation, natural-language-to-code, and IDE workflows.'
      ),
      icon: 'OpenAI.Color',
      tags: [
        t('Multi-language support'),
        t('Real-time code completion'),
        t('Natural language to code'),
      ],
      align: 'right',
      glow: 'bg-success/10',
    },
    {
      name: 'Gemini CLI',
      vendor: t('GOOGLE product'),
      description: t(
        'Google latest multimodal AI model supports unified understanding of code, images, and documents with a command-line native experience.'
      ),
      icon: 'Gemini.Color',
      tags: [
        t('Multimodal understanding'),
        t('Command-line native'),
        t('Ultra-fast response'),
      ],
      align: 'left',
      glow: 'bg-info/10',
    },
  ]

  return (
    <section className='px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-5xl'>
        <SectionHeader
          eyebrow={t('toolchain-lockup')}
          title={t('Top AI coding tools')}
          description={t(
            'One platform connects to the world most powerful AI coding assistants.'
          )}
        />

        <div className='flex flex-col gap-7'>
          {tools.map((tool, index) => (
            <AnimateInView
              key={tool.name}
              animation={tool.align === 'right' ? 'fade-left' : 'fade-right'}
              delay={index * 90}
            >
              <Card className='relative grid min-h-[13rem] p-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8'>
                <div
                  aria-hidden
                  className={cn(
                    'terminal-demo-pulse absolute inset-y-8 w-1/2 rounded-full blur-3xl',
                    tool.glow,
                    tool.align === 'right' ? 'right-8' : 'left-8'
                  )}
                  style={{ animationDelay: `${index * 450}ms` }}
                />
                <div
                  className={cn(
                    'relative flex items-center',
                    tool.align === 'right' && 'md:order-2 md:justify-end'
                  )}
                >
                  <div className='bg-card shadow-soft border-border/60 flex size-24 items-center justify-center rounded-xl border transition-transform duration-150 group-hover/card:scale-105'>
                    {getLobeIcon(tool.icon, 54)}
                  </div>
                </div>
                <div className='relative mt-6 md:mt-0'>
                  <h3 className='text-2xl font-semibold'>{tool.name}</h3>
                  <p className='text-muted-foreground mt-2 font-mono text-xs font-semibold tracking-wide'>
                    {tool.vendor}
                  </p>
                  <p className='text-muted-foreground mt-5 max-w-xl text-sm leading-7'>
                    {tool.description}
                  </p>
                  <div className='mt-6 flex flex-wrap gap-2'>
                    {tool.tags.map((tag) => (
                      <Badge key={tag} variant='outline'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </AnimateInView>
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
      <AnimateInView className='mx-auto flex max-w-4xl flex-col items-center gap-6'>
        <p className='text-muted-foreground font-mono text-sm font-medium'>
          {t('All-platform support')}
        </p>
        <div className='flex flex-wrap justify-center gap-10'>
          {platforms.map((platform, index) => (
            <div
              key={platform.label}
              className='text-muted-foreground hover:text-foreground flex flex-col items-center gap-2 transition-transform duration-150 hover:-translate-y-0.5'
              style={{ transitionDelay: `${index * 25}ms` }}
            >
              <div className='text-foreground'>{platform.icon}</div>
              <span className='font-mono text-sm'>{platform.label}</span>
            </div>
          ))}
        </div>
      </AnimateInView>
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
        <SectionHeader
          eyebrow={t('pool.scheduler')}
          title={
            <>
              {t('Flexible pooling,')}
              <span className='text-primary'> {t('pay as needed')}</span>
            </>
          }
          description={t(
            'Multiple subscription options make AI coding more economical. Share resource pools with other users and enjoy the same powerful capability.'
          )}
        />

        <div className='grid gap-5 md:grid-cols-[1.1fr_1fr_1fr]'>
          <AnimateInView className='row-span-2' delay={80}>
            <Card className='h-full p-8 md:min-h-[18rem]'>
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
                {checks.map((item, index) => (
                  <li key={item} className='flex items-center gap-3 text-sm'>
                    <span className='text-primary font-mono text-xs'>
                      [{index + 1}]
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </AnimateInView>
          {cards.map((card, index) => (
            <AnimateInView
              key={card.title}
              delay={160 + index * 80}
              className='h-full'
            >
              <Card className='h-full p-7'>
                <div className='bg-primary/10 text-primary mb-6 flex size-10 items-center justify-center rounded-lg transition-transform duration-150 group-hover/card:scale-105'>
                  {card.icon}
                </div>
                <h3 className='text-lg font-semibold'>{card.title}</h3>
                <p className='text-muted-foreground mt-4 text-sm leading-7'>
                  {card.description}
                </p>
              </Card>
            </AnimateInView>
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
        <SectionHeader
          eyebrow={t('faq.help')}
          title={t('Frequently asked questions')}
          description={t('Still have questions? We are here to answer.')}
        />

        <div className='grid gap-8 lg:grid-cols-[1fr_0.9fr]'>
          <Accordion className='gap-3' defaultValue={['start']}>
            {faqs.map((faq, index) => (
              <AnimateInView
                key={faq.question}
                delay={index * 70}
                className='mb-3'
              >
                <AccordionItem
                  value={index === 0 ? 'start' : `faq-${index}`}
                  className='bg-card border-border/70 rounded-xl border px-5'
                >
                  <AccordionTrigger className='py-5 hover:no-underline'>
                    <span className='flex items-center gap-3 text-left'>
                      <span className='text-primary font-mono text-xs'>?</span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className='text-muted-foreground leading-7'>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </AnimateInView>
            ))}
          </Accordion>

          <AnimateInView animation='fade-left' delay={120}>
            <div className='terminal-panel text-primary-foreground shadow-soft-lg relative overflow-hidden rounded-xl p-8'>
              <div aria-hidden className='bg-scanlines absolute inset-0' />
              <div className='relative'>
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
          </AnimateInView>
        </div>
      </div>
    </section>
  )
}
