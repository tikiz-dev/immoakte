'use client'

import { motion, type Variants } from 'motion/react'
import { type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Visual offset when hidden. Default: 28px slide-up. */
  y?: number
  /** Delay in seconds before the animation starts. */
  delay?: number
  /** Duration in seconds. Default 1.0s — deliberately slow so the animation
   *  is noticeable even when the user scrolls fast past the section. */
  duration?: number
  /** If true, fire only once. If false (default), replay every time the element
   *  (re-)enters the viewport — so a user scrolling back up sees the animation
   *  again instead of staring at already-revealed content. */
  once?: boolean
  /** Custom wrapper tag. Default 'div'. */
  as?: 'div' | 'section' | 'li' | 'span' | 'article'
  className?: string
}

const makeVariants = (y: number, duration: number): Variants => ({
  hidden: { opacity: 0, y },
  visible: { opacity: 1, y: 0, transition: { duration, ease: [0.22, 1, 0.36, 1] } },
})

/** Wrapper that fades + slides its children in when they enter the viewport.
 *  Default: replays on every re-entry so the animation is never wasted on a
 *  user who scrolls back up. Pass `once` to freeze after first play. */
export function Reveal({ children, y = 28, delay = 0, duration = 1.0, once = false, as = 'div', className }: RevealProps) {
  const Tag = motion[as] as typeof motion.div
  return (
    <Tag
      variants={makeVariants(y, duration)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Tag>
  )
}

/** Stagger container — wrap a list with this, then wrap each child in <RevealItem />
 *  to get a cascading entrance. Replays on re-entry by default. */
export function RevealStagger({
  children,
  className,
  staggerChildren = 0.12,
  once = false,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  staggerChildren?: number
  once?: boolean
  as?: 'div' | 'ul' | 'ol' | 'section'
}) {
  const Tag = motion[as] as typeof motion.div
  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren } } }}
      className={className}
    >
      {children}
    </Tag>
  )
}

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
}

/** Child of <RevealStagger>. Fades + slides in following the parent's stagger. */
export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
}) {
  const Tag = motion[as] as typeof motion.div
  return (
    <Tag variants={revealItemVariants} className={className}>
      {children}
    </Tag>
  )
}
