export type LegalBlock = Readonly<{
  kind: 'paragraph' | 'list' | 'subheading';
  text?: string;
  items?: readonly string[];
}>;

export type LegalSection = Readonly<{
  number: number;
  title: string;
  blocks: readonly LegalBlock[];
}>;

export type LegalDocument = Readonly<{
  title: string;
  status: 'draft' | 'approved';
  version?: string;
  updatedAt?: string;
  sections: readonly LegalSection[];
}>;
