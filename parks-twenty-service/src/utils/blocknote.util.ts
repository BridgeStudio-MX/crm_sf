export const buildBlocknoteJson = (text: string): string =>
  JSON.stringify([
    {
      id: `block-${Date.now()}`,
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      },
      content: [{ type: 'text', text, styles: {} }],
      children: [],
    },
  ]);
