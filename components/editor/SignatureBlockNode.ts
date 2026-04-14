import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Tiptap Node für Signatur-Blöcke: <div data-signature="vermieter" ...>
 * Wird vom Editor unverändert beibehalten, damit wir beim Finalisieren
 * die digital gezeichnete Unterschrift dort einfügen können.
 */
export const SignatureBlock = Node.create({
  name: 'signatureBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  selectable: false,
  atom: false,

  addAttributes() {
    return {
      'data-signature': {
        default: null,
        parseHTML: el => (el as HTMLElement).getAttribute('data-signature'),
        renderHTML: attrs => {
          if (!attrs['data-signature']) return {}
          return { 'data-signature': attrs['data-signature'] }
        },
      },
      style: {
        default: 'min-height:48px;margin-bottom:-2px;',
        parseHTML: el => (el as HTMLElement).getAttribute('style'),
        renderHTML: attrs => (attrs.style ? { style: attrs.style } : {}),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-signature]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0]
  },
})
