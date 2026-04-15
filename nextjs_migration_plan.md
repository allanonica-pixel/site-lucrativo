# Mercadoai — Plano de Migração para Next.js (SSR/SSG Completo)

> Documento técnico completo para recriar o Mercadoai em Next.js com foco total em SEO avançado,  
> ranqueamento no Google e máxima fidelidade à experiência atual do usuário (pública + administrativa).  
> **Versão de referência:** React SPA (Readdy/Vite) — Versão 21

---

## 1. Por Que Next.js?

O site atual é uma **React SPA (Single Page Application)**. O problema central é:

- O Google recebe `<div id="root"></div>` — HTML vazio
- Todo o conteúdo depende de JavaScript para renderizar
- Crawlers de redes sociais (WhatsApp, Facebook, Instagram) **não executam JS** → compartilhamentos sem imagem/título
- Indexação lenta (Second Wave Indexing do Google pode levar semanas)
- Core Web Vitals prejudicados (LCP alto, CLS instável)

**Com Next.js (App Router + SSR/SSG):**

- Cada página chega ao Google com HTML 100% renderizado
- Meta tags OG/Twitter funcionam em todos os compartilhamentos sociais
- Indexação imediata — o Googlebot lê o conteúdo na primeira visita
- Lighthouse score 95–100 é realista
- ISR (Incremental Static Regeneration) para conteúdo dinâmico sem rebuild

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 15 (App Router) | SSR/SSG/ISR nativos, metadata API, image optimization |
| Linguagem | TypeScript | Tipagem forte, mesmos tipos do projeto atual |
| Estilo | Tailwind CSS v4 | Mesmo sistema de design atual |
| Ícones | Remix Icon (CDN) + Font Awesome | Mesmo do projeto atual |
| Fontes | Google Fonts (via next/font) | Performance otimizada |
| Backend | Supabase (mesmo projeto) | Zero migração de dados |
| Auth Admin | Supabase Auth | Mesmo sistema atual |
| Imagens | next/image | Otimização automática, lazy loading, WebP |
| SEO | Next.js Metadata API | generateMetadata() por página |
| Sitemap | next-sitemap ou Route Handler | Geração automática |
| Deploy | Vercel | Integração nativa com Next.js |

---

## 3. Estrutura de Rotas (App Router)

```
app/
├── layout.tsx                    ← Layout raiz (Navbar + Footer + Providers)
├── page.tsx                      ← / (Home)
├── not-found.tsx                 ← 404
│
├── articles/
│   └── page.tsx                  ← /articles (lista com filtros ?categoria=)
│
├── guias/
│   └── page.tsx                  ← /guias (Guias de Compra — SEO dedicado)
│
├── noticias/
│   └── page.tsx                  ← /noticias (Notícias — SEO dedicado)
│
├── comparativo/
│   └── page.tsx                  ← /comparativo (lista de comparações — SEO dedicado)
│
├── artigo/
│   └── [slug]/
│       └── page.tsx              ← /artigo/[slug] (artigo individual — SSR)
│
├── comparar/
│   ├── page.tsx                  ← /comparar (lista pública)
│   └── [slug]/
│       └── page.tsx              ← /comparar/[slug] (comparação individual — SSR)
│
├── products/
│   └── page.tsx                  ← /products (lista de produtos)
│
├── produto/
│   └── [slug]/
│       └── page.tsx              ← /produto/[slug] (detalhe do produto — SSR)
│
├── ofertas/
│   └── page.tsx                  ← /ofertas (deals ativos)
│
├── categoria/
│   └── [slug]/
│       └── page.tsx              ← /categoria/[slug] (produtos por categoria)
│
├── termos/
│   └── page.tsx                  ← /termos (Termos de Uso — LGPD + afiliados)
│
├── privacidade/
│   └── page.tsx                  ← /privacidade (Política de Privacidade — LGPD)
│
├── sitemap.ts                    ← /sitemap.xml (gerado automaticamente)
├── robots.ts                     ← /robots.txt
│
└── admin/
    ├── layout.tsx                ← Layout admin (AdminLayout com sidebar)
    ├── login/
    │   └── page.tsx              ← /admin/login
    ├── page.tsx                  ← /admin (dashboard)
    ├── produtos/
    │   ├── page.tsx              ← /admin/produtos (lista)
    │   ├── novo/
    │   │   └── page.tsx          ← /admin/produtos/novo
    │   └── [id]/
    │       └── page.tsx          ← /admin/produtos/[id] (editar)
    ├── artigos/
    │   ├── page.tsx              ← /admin/artigos (lista com filtros Tipo + Categoria)
    │   ├── novo/
    │   │   └── page.tsx          ← /admin/artigos/novo
    │   └── [id]/
    │       └── page.tsx          ← /admin/artigos/[id] (editar)
    ├── subcategorias/
    │   └── page.tsx              ← /admin/subcategorias (CRUD agrupado por categoria)
    ├── deals/
    │   ├── page.tsx              ← /admin/deals (lista)
    │   ├── novo/
    │   │   └── page.tsx          ← /admin/deals/novo
    │   └── [id]/
    │       └── page.tsx          ← /admin/deals/[id] (editar)
    └── comparacoes/
        ├── page.tsx              ← /admin/comparacoes (lista)
        ├── novo/
        │   └── page.tsx          ← /admin/comparacoes/novo
        └── [id]/
            └── page.tsx          ← /admin/comparacoes/[id] (editar)
```

---

## 4. Banco de Dados Supabase (Schema Atual Completo)

### 4.1 Tabela `products`

```sql
CREATE TABLE products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  category        text NOT NULL,
  subcategory     text,
  brand           text,
  marketplace     text,           -- 'Mercado Livre', 'Amazon', 'Shopee'
  seller          text,
  price           numeric(10,2) NOT NULL,
  original_price  numeric(10,2),
  discount_pct    int,            -- calculado: ROUND(((original_price - price) / original_price) * 100)
  rating          numeric(3,1) DEFAULT 0,
  review_count    int DEFAULT 0,
  image_url       text,
  affiliate_url   text,
  free_shipping   boolean DEFAULT false,
  specs           jsonb DEFAULT '{}',   -- ex: {"processador":"Snapdragon 8 Gen 3","ram":"12GB"}
  badge           text,                 -- 'Destaque', 'Mais Vendido', 'Oferta Relâmpago'
  is_featured     boolean DEFAULT false,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### 4.2 Tabela `articles`

```sql
CREATE TABLE articles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  slug                  text UNIQUE NOT NULL,
  category              text NOT NULL,     -- 'Eletrônicos', 'Smartphones', 'Notebooks', etc.
  subcategory           text,              -- 'Android', 'True Wireless', etc.
  type                  text NOT NULL,     -- 'Review' | 'Comparativo' | 'Guia de Compra' | 'Notícias'
  excerpt               text,             -- resumo curto (aparece nos cards)
  content               text,             -- corpo completo do artigo (texto puro, parágrafos separados por \n\n)
  cover_image           text,             -- URL da imagem de capa
  author_name           text,             -- padrão: 'Equipe Mercadoai'
  author_avatar         text,             -- URL do avatar do autor
  read_time             int DEFAULT 5,    -- tempo de leitura em minutos
  views                 int DEFAULT 0,
  is_featured           boolean DEFAULT false,
  featured_product_ids  uuid[],           -- IDs de produtos para sidebar (até 3)
  related_article_ids   uuid[],           -- IDs de artigos relacionados (até 3)
  meta_title            text,             -- SEO: título customizado (max 60 chars)
  meta_description      text,             -- SEO: descrição customizada (max 160 chars)
  meta_keywords         text,             -- SEO: palavras-chave separadas por vírgula
  published_at          timestamptz DEFAULT now(),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
```

### 4.3 Tabela `deals`

```sql
CREATE TABLE deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid REFERENCES products(id) ON DELETE SET NULL,
  title           text NOT NULL,
  product_name    text NOT NULL,
  category        text,
  discount_pct    int NOT NULL,
  deal_price      numeric(10,2) NOT NULL,
  original_price  numeric(10,2) NOT NULL,
  marketplace     text NOT NULL,
  seller          text,
  affiliate_url   text,
  image_url       text,
  free_shipping   boolean DEFAULT false,
  expires_at      timestamptz,            -- null = sem expiração
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);
```

### 4.4 Tabela `comparisons`

```sql
CREATE TABLE comparisons (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  slug                  text UNIQUE NOT NULL,
  product_ids           uuid[] NOT NULL,          -- array de IDs dos produtos comparados (mín. 2)
  winner_id             uuid REFERENCES products(id),  -- null = calculado automaticamente por score
  criteria              jsonb DEFAULT '{}',        -- ex: {"Câmera":[9,8,7],"Bateria":[8,9,7]}
  summary               text,                     -- introdução/resumo do comparativo
  is_published          boolean DEFAULT false,
  featured_product_ids  uuid[],                   -- produtos complementares para sidebar (até 3)
  related_article_ids   uuid[],                   -- artigos relacionados para sidebar (até 3)
  meta_title            text,
  meta_description      text,
  meta_keywords         text,
  published_at          timestamptz DEFAULT now(),
  created_at            timestamptz DEFAULT now()
);
```

### 4.5 Tipos TypeScript (replicar exatamente)

```typescript
// lib/supabase/types.ts

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  brand: string | null;
  marketplace: string | null;
  seller: string | null;
  price: number;
  original_price: number | null;
  discount_pct: number | null;
  rating: number;
  review_count: number;
  image_url: string | null;
  affiliate_url: string | null;
  free_shipping: boolean;
  specs: Record<string, string>;
  badge: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  type: string;                   // 'Review' | 'Comparativo' | 'Guia de Compra' | 'Notícias'
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_name: string | null;
  author_avatar: string | null;
  read_time: number;
  views: number;
  is_featured: boolean;
  featured_product_ids?: string[];
  related_article_ids?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  product_name: string;
  category: string | null;
  discount_pct: number;
  deal_price: number;
  original_price: number;
  marketplace: string;
  seller: string | null;
  affiliate_url: string | null;
  image_url: string | null;
  free_shipping: boolean;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Comparison {
  id: string;
  title: string;
  slug: string;
  product_ids: string[];
  winner_id: string | null;
  criteria: Record<string, number[]>;
  summary: string | null;
  is_published: boolean;
  featured_product_ids?: string[];
  related_article_ids?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  published_at: string | null;
  created_at: string;
}
```

---

## 5. SEO — Implementação Completa por Página

### 5.1 Padrão de generateMetadata() para cada página

```typescript
// app/artigo/[slug]/page.tsx
import type { Metadata } from 'next'

const SITE_URL = 'https://mercadoai.com'
const SITE_NAME = 'Mercadoai'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  if (!article) return { title: 'Artigo não encontrado | Mercadoai' }

  const metaTitle = article.meta_title
    ? `${article.meta_title} | ${SITE_NAME}`
    : `${article.title} | ${SITE_NAME}`

  const metaDescription = article.meta_description
    ?? article.excerpt
    ?? `${article.title} — Leia o ${article.type} completo no ${SITE_NAME}.`

  const metaKeywords = article.meta_keywords
    ?? `${article.title}, ${article.category}, ${article.type}, ${SITE_NAME}`

  const canonicalUrl = `${SITE_URL}/artigo/${params.slug}`
  const publishedDate = new Date(article.published_at).toISOString()
  const modifiedDate = new Date(article.updated_at).toISOString()

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: article.author_name ?? SITE_NAME }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      images: article.cover_image ? [{
        url: article.cover_image,
        width: 1200,
        height: 630,
        alt: article.title,
        type: 'image/jpeg',
      }] : [],
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: [article.author_name ?? SITE_NAME],
      section: article.category,
      tags: [article.type, article.category],
    },
    twitter: {
      card: article.cover_image ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDescription,
      images: article.cover_image ? [article.cover_image] : [],
      site: '@mercadoai',
      creator: '@mercadoai',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    other: {
      'Last-modified': modifiedDate,
    },
  }
}
```

### 5.2 Schema.org JSON-LD por tipo de página

```typescript
// components/seo/ArticleSchema.tsx — renderizado no servidor
export function ArticleSchema({ article, slug }: { article: Article; slug: string }) {
  const canonicalUrl = `https://mercadoai.com/artigo/${slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': article.type === 'Review' ? 'Review' : 'Article',
    headline: article.title,
    description: article.excerpt ?? article.title,
    ...(article.cover_image ? {
      image: {
        '@type': 'ImageObject',
        url: article.cover_image,
        width: 1200,
        height: 630,
        caption: article.title,
      },
      thumbnailUrl: article.cover_image,
    } : {}),
    author: {
      '@type': 'Person',
      name: article.author_name ?? 'Mercadoai',
      url: `https://mercadoai.com/autor/${(article.author_name ?? '').toLowerCase().replace(/\s+/g, '-')}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mercadoai',
      url: 'https://mercadoai.com',
      logo: { '@type': 'ImageObject', url: 'https://mercadoai.com/logo.png' },
    },
    datePublished: new Date(article.published_at).toISOString(),
    dateModified: new Date(article.updated_at).toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleSection: article.subcategory
      ? `${article.category} › ${article.subcategory}`
      : article.category,
    keywords: article.meta_keywords ?? `${article.category}, ${article.type}`,
    inLanguage: 'pt-BR',
    url: canonicalUrl,
    wordCount: article.content ? article.content.split(' ').length : 800,
    timeRequired: `PT${article.read_time}M`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// BreadcrumbList Schema
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Product Schema
export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url,
    brand: { '@type': 'Brand', name: product.brand ?? 'Mercadoai' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: product.affiliate_url,
      seller: { '@type': 'Organization', name: product.marketplace ?? 'Mercadoai' },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
      bestRating: 5,
      worstRating: 1,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 5.3 Sitemap Automático (app/sitemap.ts)

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = 'https://mercadoai.com'

function articlePriority(type: string): number {
  switch (type) {
    case 'Notícias': return 0.85
    case 'Review': return 0.82
    case 'Guia de Compra': return 0.80
    case 'Comparativo': return 0.80
    default: return 0.75
  }
}

function articleChangeFreq(type: string): MetadataRoute.Sitemap[0]['changeFrequency'] {
  return type === 'Notícias' ? 'daily' : 'monthly'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const [
    { data: products },
    { data: articles },
    { data: comparisons },
  ] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('articles').select('slug, updated_at, published_at, type, subcategory, category'),
    supabase.from('comparisons').select('slug, published_at').eq('is_published', true),
  ])

  const now = new Date()

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/ofertas`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/guias`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/noticias`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/comparativo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    // Categorias
    ...['eletronicos','smartphones','notebooks','games','eletrodomesticos','fones','smartwatches','casa-cozinha'].map(cat => ({
      url: `${SITE_URL}/categoria/${cat}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  // Subcategorias dinâmicas
  const subcatSet = new Set<string>()
  const subcatPages: MetadataRoute.Sitemap = []
  for (const article of articles ?? []) {
    if (article.subcategory && article.type) {
      const key = `${article.type}||${article.subcategory}`
      if (!subcatSet.has(key)) {
        subcatSet.add(key)
        subcatPages.push({
          url: `${SITE_URL}/articles?categoria=${encodeURIComponent(article.type)}&subcategoria=${encodeURIComponent(article.subcategory)}`,
          lastModified: now,
          changeFrequency: articleChangeFreq(article.type),
          priority: articlePriority(article.type) - 0.05,
        })
      }
    }
  }

  // Produtos dinâmicos
  const productPages: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url: `${SITE_URL}/produto/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.70,
  }))

  // Artigos dinâmicos
  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
    url: `${SITE_URL}/artigo/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : now,
    changeFrequency: articleChangeFreq(a.type),
    priority: articlePriority(a.type),
  }))

  // Comparações dinâmicas
  const comparisonPages: MetadataRoute.Sitemap = (comparisons ?? []).map(c => ({
    url: `${SITE_URL}/comparar/${c.slug}`,
    lastModified: c.published_at ? new Date(c.published_at) : now,
    changeFrequency: 'monthly',
    priority: 0.78,
  }))

  return [...staticPages, ...subcatPages, ...productPages, ...articlePages, ...comparisonPages]
}
```

### 5.4 robots.ts

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
      {
        userAgent: 'AhrefsBot',
        crawlDelay: 10,
      },
      {
        userAgent: 'SemrushBot',
        crawlDelay: 10,
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
    ],
    sitemap: 'https://mercadoai.com/sitemap.xml',
  }
}
```

---

## 6. Páginas Públicas — Especificação Completa

### 6.1 Home (`/`)

**Seções em ordem (de cima para baixo):**

1. **Navbar** — fixa no topo, altura 64px
2. **Category Bar** — fixa abaixo da navbar, altura ~40px, scroll horizontal
3. **HeroSection** — slider automático com 3 slides, intervalo 4s, imagem de fundo + overlay gradiente da esquerda, texto e CTA à esquerda
4. **DealsSection** — "Ofertas do Dia" com countdown em tempo real, cards horizontais com desconto em vermelho
5. **FeaturedProducts** — "Produtos em Destaque" — grid de cards de produto (ver spec do card abaixo)
6. **MarketplacesSection** — logos dos marketplaces (Mercado Livre, Amazon, Shopee, Americanas, Magazine Luiza, Casas Bahia)
7. **CategorySection** — grid de categorias com imagem de fundo e ícone
8. **LatestArticles** — últimos artigos com card destaque grande + grid 3 colunas
9. **NewsletterSection** — CTA de newsletter
10. **Footer**

**Dados buscados:**
- Produtos: `is_featured = true`, `is_active = true`, limit 8
- Deals: `is_active = true`, ordenado por `discount_pct DESC`, limit 6
- Artigos: ordenado por `published_at DESC`, limit 7

### 6.2 ProductCard (componente padrão — usado em TODA listagem de produto)

```
┌─────────────────────────────────┐
│  [imagem 190px altura]          │  object-cover object-center, bg-gray-100
├─────────────────────────────────┤
│  [badge] [marketplace]          │  badges: 'Destaque'=orange, 'Mais Vendido'=emerald
│  Nome do produto (2 linhas)     │  font-semibold text-sm
│  ★★★★☆ 4.5 (1.234)             │  rating + review_count
│  ~~R$ 2.999~~ -30%              │  original_price riscado + discount_pct vermelho
│  R$ 2.099                       │  price em destaque, font-black
│  [🚚 Frete Grátis]              │  só se free_shipping = true
│  [Ver Oferta →]                 │  link externo com rel="nofollow noopener"
└─────────────────────────────────┘
```

**Comportamento:**
- Hover: borda laranja (`border-orange-200`), escala leve na imagem
- Clique no card: navega para `/produto/[slug]`
- Clique em "Ver Oferta": abre `affiliate_url` em nova aba com `rel="nofollow noopener noreferrer"`
- Sem `affiliate_url`: botão desabilitado ou oculto

### 6.3 ArticleCard (componente padrão — usado em TODA listagem de artigo)

```
┌─────────────────────────────────┐
│  [imagem 190px altura]          │  object-cover object-center, bg-gray-100
├─────────────────────────────────┤
│  [tipo badge] [subcategoria]    │  Review=emerald, Comparativo=amber, Guia=sky, Notícias=rose
│  Título do artigo (2 linhas)    │  font-semibold text-base
│  Excerpt (2 linhas)             │  text-sm text-gray-500
│  [avatar] Autor · Xmin · Data  │  rodapé com metadados
└─────────────────────────────────┘
```

### 6.4 `/articles` — Lista de Artigos

**Comportamento:**
- URL params: `?categoria=Review` e `?subcategoria=Android`
- Hero escuro (`bg-gray-950`) com breadcrumb, ícone, h1 e subtítulo
- Barra de subcategorias dinâmica (só aparece se houver subcategorias com conteúdo)
- Card destaque (primeiro artigo `is_featured`) — imagem limpa sem overlay + info abaixo em fundo branco
- Grid 3 colunas de ArticleCards
- SEO dinâmico por categoria (ver `seoByCategory` no código atual)

**Dados:** `supabase.from('articles').select('*').order('published_at', { ascending: false })`

### 6.5 `/guias` — Guias de Compra

- Filtra: `type = 'Guia de Compra'`
- Hero: ícone sky (`ri-book-open-line`), badge "Guias de Compra", h1 "Como Escolher o Melhor Produto"
- Subcategorias dinâmicas com botão ativo em `bg-sky-500`
- Card destaque sem overlay + info abaixo
- Grid de ArticleCards com hover `border-sky-200`

### 6.6 `/noticias` — Notícias

- Filtra: `type = 'Notícias'`
- Hero: ícone rose (`ri-newspaper-line`), badge "Notícias", h1 "Últimas Notícias de Tecnologia"
- Layout especial: **notícia destaque** (esquerda, imagem limpa) + **3 últimas** (direita, cards horizontais com thumbnail 80×64px)
- Grid de ArticleCards abaixo com hover `border-rose-200`

### 6.7 `/comparativo` — Lista de Comparações

- Filtra: `is_published = true`
- Hero: ícone teal (`ri-scales-3-line`), badge "Comparativos"
- Filtro de categorias dinâmico (extraído dos produtos das comparações)
- ComparisonCard: mostra imagens dos produtos lado a lado com "VS", badge de vencedor (troféu âmbar), contagem de produtos e critérios

### 6.8 `/artigo/[slug]` — Artigo Individual

**Estrutura da página:**
1. Breadcrumb (Home > Artigos > Categoria > Subcategoria > Título)
2. **Imagem de capa** — fullscreen, `h-[320px] md:h-[460px]`, `object-cover object-center`, **SEM overlay de escurecimento**
3. **Faixa de metadados** — fundo branco abaixo da imagem: tipo badge, categoria badge, h1 (título), autor (avatar + nome), data, tempo de leitura, views
4. **Layout 2/3 + 1/3:**
   - **Artigo** (2/3): excerpt em destaque (borda laranja esquerda), corpo do artigo (parágrafos), citação no meio, tags, botões de compartilhamento (WhatsApp, Twitter/X, Facebook, Copiar link), card do autor
   - **Sidebar** (1/3): Produtos em Destaque (até 3), Artigos Relacionados (até 3), Newsletter CTA
5. **Mais Artigos** — seção rodapé com grid 3 colunas

**Compartilhamento:**
- WhatsApp: `https://wa.me/?text={title}%20{url}`
- Twitter/X: `https://twitter.com/intent/tweet?text={title}&url={url}`
- Facebook: `https://www.facebook.com/sharer/sharer.php?u={url}`
- Copiar link: `navigator.clipboard.writeText(window.location.href)`

### 6.9 `/comparar/[slug]` — Comparação Individual

**Estrutura:**
1. Breadcrumb
2. Header: badge "Comparativo", data, h1 (título), summary
3. **Winner Banner** — destaque verde com troféu, nome do vencedor, score total, preço e botão "Ver Oferta"
4. **Tabs:** Visão Geral | Especificações | Pontuações
5. **Sidebar** (quando há `featured_product_ids` ou `related_article_ids`): Produtos em Destaque + Artigos Relacionados

**Tab Visão Geral:** tabela com produtos nas colunas, linhas: Avaliação (estrelas), Marketplace, Frete Grátis, Desconto, botão Ver Oferta. Coluna do vencedor com fundo `bg-emerald-50`.

**Tab Especificações:** tabela com specs do `jsonb`, valores do vencedor em `text-emerald-700`.

**Tab Pontuações:** grid com barras de progresso por critério, totais no rodapé escuro, cards individuais com score e botão Ver Oferta.

### 6.10 `/produto/[slug]` — Detalhe do Produto

- Imagem grande + galeria
- Nome, rating, preço (com original riscado e desconto)
- Botão "Ver Oferta" com `affiliate_url`
- Specs em tabela (do campo `jsonb`)
- Produtos relacionados da mesma categoria

### 6.11 `/ofertas` — Deals

- Hero vermelho/laranja com contador de ofertas ativas
- Filtros por categoria (tabs horizontais)
- Cards de deal com countdown em tempo real (se `expires_at` definido)
- Ordenação por desconto

### 6.12 `/categoria/[slug]` — Categoria

- Hero com nome da categoria e contagem de produtos
- Grid de ProductCards filtrados por categoria
- Filtros de subcategoria dinâmicos

---

## 7. Navbar — Especificação Completa

**Estrutura (2 barras fixas):**

### Barra Principal (z-50, h-16)
- **Logo** (esquerda): imagem `https://public.readdy.ai/ai/img_res/3f2f095b-9985-4601-9265-8f102d76ede6.png`, h-10
- **Links desktop** (centro):
  - Dropdown "Categorias" com 8 categorias (ícone Remix Icon + label)
  - "Ofertas" → `/ofertas`
  - Separador visual (linha vertical)
  - "Reviews" → `/articles?categoria=Review`
  - "Comparativos" → `/comparativo`
  - "Notícias" → `/noticias`
  - "Guias" → `/guias`
- **Busca** (direita): input com expand ao focar (`w-48 → w-72`)
- **Mobile**: hamburger → menu vertical com todos os links

### Barra de Categorias (z-40, abaixo da principal)
- Scroll horizontal com pills: Todos, Eletrônicos, Smartphones, Notebooks, Games, Eletrodomésticos, Fones, Smartwatches, Casa
- Pill "Ofertas" com ponto vermelho pulsante
- Link "Ver todas" à direita

**Comportamento:**
- Ambas as barras são fixas (`fixed top-0` e `fixed top-16`)
- Conteúdo das páginas tem `pt-[104px]` para compensar as 2 barras
- Dropdown de categorias fecha ao clicar fora (useRef + mousedown listener)
- Link ativo: `text-orange-500 bg-orange-50`

---

## 8. Footer — Especificação Completa

**Fundo:** `bg-stone-900` (cinza muito escuro, NÃO preto)

**4 colunas:**
1. Logo (invertido/branco) + descrição + ícones sociais (Instagram, YouTube, TikTok, Facebook)
2. "Categorias Populares" — lista com ícone laranja
3. "Recursos" — links: Guias de Compra, Reviews, Melhores Ofertas, Sobre Nós, Contato, Política de Privacidade, Termos de Uso
4. "Receba Ofertas Exclusivas" — CTA de newsletter

**Rodapé:** copyright + links Termos/Privacidade/Cookies

---

## 9. Painel Admin — Especificação Completa

### 9.1 AdminLayout (sidebar)

```
┌──────────────────────────────────────────────────────┐
│ [Logo Mercadoai]                    [Sair]           │  ← header
├──────────────────────────────────────────────────────┤
│ SIDEBAR (w-56)    │  CONTEÚDO PRINCIPAL              │
│                   │                                  │
│ Dashboard         │  (conteúdo da página)            │
│ Produtos          │                                  │
│ Artigos           │                                  │
│ Deals             │                                  │
│ Comparações       │                                  │
│                   │                                  │
│ [Ver Site →]      │                                  │
└──────────────────────────────────────────────────────┘
```

- Sidebar fixa, link ativo com `bg-orange-50 text-orange-600`
- Autenticação via Supabase Auth — redireciona para `/admin/login` se não autenticado
- Botão "Sair" chama `supabase.auth.signOut()`

### 9.2 Dashboard (`/admin`)

**4 cards de stats** (buscados em paralelo com `Promise.all`):
- Produtos (laranja) → `/admin/produtos`
- Artigos (emerald) → `/admin/artigos`
- Deals Ativos (rose) → `/admin/deals`
- Comparações (teal) → `/admin/comparacoes`

**Ações Rápidas:** 4 botões coloridos para criar novo item de cada tipo

### 9.3 Formulário de Artigos (`/admin/artigos/novo` e `/admin/artigos/[id]`)

**Seções do formulário:**

#### Informações Básicas
- Título* (auto-gera slug e meta_title)
- Slug* (editável, auto-gerado do título via `slugify()`)
- Tipo* (select: Review | Comparativo | Guia de Compra | Notícias)
- Categoria* (select com 9 opções)
- Subcategoria (select dinâmico baseado na categoria, ou input livre)
- Tempo de Leitura (número, padrão: 5)
- Excerpt/Resumo (textarea, max 300 chars, contador)

#### SEO Avançado
- **Preview do Google** em tempo real (URL, título verde, descrição)
- Meta Title (max 60 chars, contador colorido: verde/âmbar/vermelho)
- Meta Description (max 160 chars, contador colorido)
- **Palavras-chave** (input, separadas por vírgula, preview como tags âmbar, contador de palavras, aviso sobre keyword stuffing)

#### Conteúdo do Artigo
- Textarea grande (18 linhas, font-mono)
- Botão "Preview" no header que alterna para visualização do artigo

#### Produtos em Destaque (sidebar)
- Filtros independentes: Categoria + Subcategoria
- Busca por nome
- Lista scrollável com checkbox visual (até 3 produtos)
- Tags removíveis dos selecionados

#### Artigos Relacionados (sidebar)
- Filtros independentes: Tipo + Categoria + Subcategoria
- Busca por título
- Lista scrollável com checkbox visual (até 3 artigos)
- Tags removíveis dos selecionados

#### Autor e Mídia
- Nome do Autor (padrão: "Equipe Mercadoai")
- Avatar URL + miniatura ao lado do input
- Imagem de Capa URL + **preview em tempo real** (h-48, com fallback de erro)

#### Configurações
- Toggle "Artigo em Destaque"

**Fluxo de publicação:**
1. Clique em "Publicar Artigo" / "Editar Artigo"
2. Modal de confirmação: "Deseja Publicar Agora?" com botões Cancelar / Sim, Publicar
3. Após confirmar: loading no botão → sucesso → tela de "Artigo Publicado com Sucesso!" por 2s → redirect para `/admin/artigos`

### 9.4 Formulário de Comparações (`/admin/comparacoes/novo` e `/admin/comparacoes/[id]`)

**Seções:**

#### Informações Básicas
- Título* (auto-gera slug)
- Slug* + preview da URL `/comparar/[slug]`
- Toggle "Publicar comparação"
- Resumo/Introdução (textarea, max 500 chars)

#### Seleção de Produtos
- Busca com dropdown autocomplete
- Produtos selecionados exibidos como tags removíveis
- Mínimo 2 produtos obrigatório

#### Definir Vencedor
- Grid de botões com imagem de cada produto + opção "Auto (por score)"
- Vencedor selecionado com borda teal + badge troféu

#### Critérios de Avaliação
- Grid dinâmico: coluna de nome + colunas de score por produto
- Scores de 0 a 10 (step 0.5)
- Botão "Adicionar Critério" / botão X para remover

#### SEO Avançado
- Mesmo padrão do formulário de artigos (preview Google + meta title + meta description + keywords)

#### Produtos em Destaque (sidebar)
- Produtos complementares (excluindo os já na comparação)
- Até 3, com busca

#### Artigos Relacionados (sidebar)
- Busca por título/categoria
- Até 3, com tipo badge colorido

**Fluxo de publicação:** mesmo modal de confirmação do formulário de artigos (cor teal)

### 9.5 Formulário de Produtos (`/admin/produtos/novo` e `/admin/produtos/[id]`)

**Campos:**
- Nome*, Slug* (auto-gerado), Categoria*, Subcategoria
- Marca, Marketplace (select: Mercado Livre, Amazon, Shopee, Americanas, Magazine Luiza, Casas Bahia, Outro)
- Vendedor
- Preço*, Preço Original (calcula desconto automaticamente)
- Rating (0-5), Contagem de Reviews
- URL da Imagem + preview
- URL de Afiliado*
- Frete Grátis (toggle)
- Specs (editor de pares chave-valor dinâmico)
- Badge (select: Destaque, Mais Vendido, Oferta Relâmpago, vazio)
- Produto em Destaque (toggle)
- Produto Ativo (toggle)

### 9.6 Formulário de Deals (`/admin/deals/novo` e `/admin/deals/[id]`)

**Campos:**
- Título*, Nome do Produto*
- Categoria, % de Desconto*, Preço do Deal*, Preço Original*
- Marketplace*, Vendedor
- URL de Afiliado, URL da Imagem + preview
- Frete Grátis (toggle)
- Data de Expiração (datetime-local, opcional)
- Deal Ativo (toggle)

---

## 10. Categorias e Subcategorias (constantes)

```typescript
// constants/categories.ts
export const CATEGORIES: Record<string, string[]> = {
  'Eletrônicos':       ['Áudio', 'Câmeras', 'Acessórios', 'Carregadores', 'Cabos'],
  'Smartphones':       ['Android', 'iPhone', 'Acessórios', 'Capas', 'Películas'],
  'Notebooks':         ['Gamer', 'Ultrafino', 'Corporativo', 'Chromebook', 'Acessórios'],
  'Games':             ['Console', 'PC Gamer', 'Periféricos', 'Jogos', 'Cadeiras Gamer'],
  'Eletrodomésticos':  ['Cozinha', 'Limpeza', 'Climatização', 'Lavanderia', 'Geladeiras'],
  'Fones':             ['In-ear', 'Over-ear', 'On-ear', 'True Wireless', 'Headset Gamer'],
  'Smartwatches':      ['Fitness', 'Esportivo', 'Casual', 'Infantil', 'Acessórios'],
  'Casa & Cozinha':    ['Organização', 'Decoração', 'Utensílios', 'Iluminação', 'Jardim'],
  'Geral':             [],
}

export const ARTICLE_TYPES = ['Review', 'Comparativo', 'Guia de Compra', 'Notícias'] as const

export const MARKETPLACES = [
  'Mercado Livre', 'Amazon', 'Shopee',
  'Americanas', 'Magazine Luiza', 'Casas Bahia', 'Outro'
] as const

export const PRODUCT_BADGES = ['Destaque', 'Mais Vendido', 'Oferta Relâmpago'] as const

// Slugs de categoria para URL
export const CATEGORY_SLUGS: Record<string, string> = {
  'Eletrônicos':       'eletronicos',
  'Smartphones':       'smartphones',
  'Notebooks':         'notebooks',
  'Games':             'games',
  'Eletrodomésticos':  'eletrodomesticos',
  'Fones':             'fones',
  'Smartwatches':      'smartwatches',
  'Casa & Cozinha':    'casa-cozinha',
}

// Cores por tipo de artigo
export const TYPE_COLORS: Record<string, string> = {
  'Review':        'bg-emerald-100 text-emerald-700',
  'Comparativo':   'bg-amber-100 text-amber-700',
  'Guia de Compra':'bg-sky-100 text-sky-700',
  'Notícias':      'bg-rose-100 text-rose-700',
}

// Autor padrão
export const DEFAULT_AUTHOR_NAME = 'Equipe Mercadoai'
export const DEFAULT_AUTHOR_AVATAR = 'https://readdy.ai/api/search-image?query=professional%20tech%20reviewer%20portrait%20smiling%20confident%20person%20clean%20background%20editorial%20photography&width=80&height=80&seq=author1&orientation=squarish'
```

---

## 11. Utilitários

```typescript
// lib/utils.ts

// Gera slug a partir de texto
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Formata valor em BRL
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Formata data em pt-BR
export function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('pt-BR', options ?? {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Calcula tempo restante para countdown
export function getTimeRemaining(expiresAt: string) {
  const total = new Date(expiresAt).getTime() - Date.now()
  if (total <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    expired: false,
  }
}
```

---

## 12. Supabase Client (Next.js)

```typescript
// lib/supabase/client.ts — para Client Components
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts — para Server Components e generateMetadata
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## 13. Estratégia de Renderização por Página

| Página | Estratégia | Justificativa |
|--------|-----------|---------------|
| `/` | ISR (revalidate: 3600) | Conteúdo muda com frequência mas não em tempo real |
| `/articles` | SSR | Filtros por query params |
| `/guias` | ISR (revalidate: 86400) | Conteúdo muda pouco |
| `/noticias` | ISR (revalidate: 1800) | Notícias são frequentes |
| `/comparativo` | ISR (revalidate: 86400) | Conteúdo estável |
| `/artigo/[slug]` | ISR (revalidate: 3600) | SEO crítico, conteúdo pode ser editado |
| `/comparar/[slug]` | ISR (revalidate: 86400) | Conteúdo estável |
| `/produto/[slug]` | ISR (revalidate: 3600) | Preços mudam |
| `/ofertas` | SSR | Countdown em tempo real |
| `/categoria/[slug]` | ISR (revalidate: 3600) | Produtos mudam |
| `/admin/*` | CSR (Client-side) | Não precisa de SEO, requer auth |

---

## 14. Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ucencxnnvtiitpucfnds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # apenas no servidor, nunca expor no cliente
NEXT_PUBLIC_SITE_URL=https://mercadoai.com
```

---

## 15. Deploy (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Variáveis de ambiente no Vercel Dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# NEXT_PUBLIC_SITE_URL
```

**Configurações recomendadas no Vercel:**
- Framework Preset: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Node.js Version: 20.x

---

## 16. Checklist de Migração

### Fase 1 — Setup
- [ ] `npx create-next-app@latest mercadoai --typescript --tailwind --app --src-dir`
- [ ] Instalar dependências: `@supabase/supabase-js @supabase/ssr`
- [ ] Configurar variáveis de ambiente
- [ ] Configurar Supabase client (server + client)
- [ ] Adicionar Remix Icon e Font Awesome via CDN no `layout.tsx`
- [ ] Configurar Google Fonts via `next/font`

### Fase 2 — Componentes Base
- [ ] `ProductCard` — exatamente como especificado na seção 6.2
- [ ] `ArticleCard` — exatamente como especificado na seção 6.3
- [ ] `Navbar` — 2 barras fixas, dropdown categorias, links editoriais
- [ ] `Footer` — 4 colunas, fundo stone-900
- [ ] `AdminLayout` — sidebar com links, auth guard

### Fase 3 — Páginas Públicas (por prioridade SEO)
- [ ] `/artigo/[slug]` — maior impacto SEO, SSR com generateMetadata
- [ ] `/comparar/[slug]` — SSR com generateMetadata
- [ ] `/produto/[slug]` — SSR com generateMetadata + Product Schema
- [ ] `/` — ISR, todas as seções
- [ ] `/articles`, `/guias`, `/noticias`, `/comparativo` — ISR/SSR
- [ ] `/ofertas`, `/categoria/[slug]` — ISR/SSR

### Fase 4 — SEO Técnico
- [ ] `generateMetadata()` em todas as páginas
- [ ] Schema.org JSON-LD em todas as páginas
- [ ] `app/sitemap.ts` — geração automática
- [ ] `app/robots.ts`
- [ ] `next/image` em todas as imagens (width, height, priority para LCP)
- [ ] Canonical URLs em todas as páginas

### Fase 5 — Painel Admin
- [ ] Auth guard no `app/admin/layout.tsx`
- [ ] Dashboard com stats
- [ ] CRUD completo de Produtos
- [ ] CRUD completo de Artigos (com todos os campos do formulário atual)
- [ ] CRUD completo de Comparações (com critérios dinâmicos)
- [ ] CRUD completo de Deals

### Fase 6 — Qualidade
- [ ] Lighthouse score > 90 em todas as páginas públicas
- [ ] Testar compartilhamento no WhatsApp (OG tags)
- [ ] Testar compartilhamento no Facebook (OG tags)
- [ ] Submeter sitemap no Google Search Console
- [ ] Verificar indexação no Google Search Console

---

## 17. Pontos Críticos de Fidelidade

> Estes detalhes são essenciais para manter a experiência idêntica ao site atual.

1. **`pt-[104px]`** em todas as páginas públicas — compensa as 2 barras fixas (navbar 64px + category bar 40px)
2. **Imagens SEM overlay** nas heroes de `/articles`, `/guias`, `/noticias`, `/comparativo` — imagem limpa, metadados abaixo em fundo branco
3. **`object-cover object-center`** em TODAS as imagens de card — nunca `object-top`
4. **`rel="nofollow noopener noreferrer"`** em TODOS os links de afiliado
5. **Modal de confirmação** antes de publicar artigo ou comparação
6. **Subcategorias dinâmicas** — só exibir subcategorias que têm conteúdo no banco
7. **`meta_keywords` do banco** tem prioridade sobre keywords geradas automaticamente
8. **OG image dinâmica** — usa `cover_image` do artigo ou `image_url` do produto vencedor
9. **Countdown em tempo real** nos deals com `expires_at`
10. **Autor padrão** "Equipe Mercadoai" pré-preenchido no formulário de artigos
11. **Preview da imagem de capa** em tempo real no formulário de artigos
12. **Filtros independentes** de categoria/subcategoria nos seletores de produtos e artigos do admin
13. **Score automático** na comparação: se `winner_id` for null, o vencedor é calculado pela soma dos critérios
14. **`is_active = false`** remove produto do sitemap e das listagens públicas
15. **`is_published = false`** remove comparação do sitemap e das listagens públicas

---

## 18. Padronização de Hero e Cards (implementada em Abril/2026)

> Estas padronizações foram aplicadas no projeto React atual e **devem ser replicadas com precisão** no Next.js.

### 18.1 Hero Padrão — Todas as Páginas de Listagem

Todas as páginas de listagem (`/articles`, `/guias`, `/noticias`, `/comparativo`) usam **exatamente o mesmo padrão de Hero**:

```tsx
// Padrão de Hero unificado — replicar em TODAS as páginas de listagem
<section className="pt-32 pb-8 bg-gray-950">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
      <Link to="/" className="hover:text-orange-400 transition-colors">Home</Link>
      <i className="ri-arrow-right-s-line"></i>
      <span className="text-gray-300 font-medium">{nomeDaSecao}</span>
      {/* subcategoria ativa, se houver */}
      {activeSub && (
        <>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-200 font-semibold">{activeSub}</span>
        </>
      )}
    </nav>
    {/* H1 direto, sem ícone decorativo, sem badge colorido */}
    <h1 className="text-3xl font-black text-white mb-2">{titulo}</h1>
    <p className="text-gray-400 text-sm max-w-xl">{subtitulo}</p>
  </div>
</section>
```

**Regras do Hero:**
- Fundo: `bg-gray-950` (cinza quase preto) — igual em todas
- Padding: `pt-32 pb-8` — igual em todas
- **SEM ícone decorativo** (ex: `ri-book-open-line` grande)
- **SEM badge colorido** (ex: pill "Guias de Compra" em sky-500)
- Apenas: breadcrumb → H1 → subtítulo pequeno em `text-sm text-gray-400`
- H1: `text-3xl font-black text-white mb-2`
- Subtítulo: `text-gray-400 text-sm max-w-xl`

### 18.2 ArticleCard Padrão — Tamanho Reduzido (50%)

O card de artigo padrão foi reduzido para ser mais compacto. Este é o padrão a replicar em `/articles`, `/guias` e `/noticias`:

```tsx
// ArticleCard padrão — compacto (50% menor que versão anterior)
<Link
  to={`/artigo/${article.slug}`}
  className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-orange-200 transition-all duration-200 cursor-pointer flex flex-col"
>
  {/* Imagem: h-[110px] — 50% menor que o anterior h-[190px] */}
  <div className="h-[110px] overflow-hidden bg-gray-100">
    <img
      src={article.cover_image}
      alt={article.title}
      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
    />
  </div>
  {/* Corpo: p-3 (antes p-5) */}
  <div className="p-3 flex flex-col flex-1">
    {/* Badges: text-[10px] px-2 (antes text-xs px-2.5) */}
    <div className="flex items-center gap-1.5 mb-2">
      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full w-fit {corDoTipo}">
        {article.type}
      </span>
      {/* subcategoria como botão clicável, se existir */}
      {art.subcategory && (
        <button className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors cursor-pointer">
          {art.subcategory}
        </button>
      )}
    </div>
    {/* Título: text-sm (antes text-base), line-clamp-2, mb-1 */}
    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1 flex-1 group-hover:text-orange-600 transition-colors">
      {article.title}
    </h3>
    {/* Excerpt: text-xs line-clamp-1 mb-2 (antes text-sm line-clamp-2 mb-4) */}
    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{article.excerpt}</p>
    {/* Footer: gap-2 pt-2 (antes gap-3 pt-4) */}
    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
      {/* Avatar: w-5 h-5 (antes w-7 h-7) */}
      <div className="w-5 h-5 flex items-center justify-center rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        <img src={article.author_avatar} alt={article.author_name} className="w-full h-full object-cover object-top" />
      </div>
      <span className="text-[10px] font-medium text-gray-700 truncate">{article.author_name}</span>
      <span className="text-gray-300">·</span>
      <span className="text-[10px] text-gray-400 whitespace-nowrap">{article.read_time} min</span>
      <span className="text-gray-300">·</span>
      <span className="text-[10px] text-gray-400 whitespace-nowrap">{dataFormatada}</span>
    </div>
  </div>
</Link>
```

**Tabela de diferenças (antes → depois):**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Imagem altura | `h-[190px]` | `h-[110px]` |
| Padding interno | `p-5` | `p-3` |
| Gap badges | `gap-2` | `gap-1.5` |
| Tamanho badge | `text-xs px-2.5` | `text-[10px] px-2` |
| Título | `text-base mb-2` | `text-sm mb-1` |
| Excerpt | `text-sm line-clamp-2 mb-4` | `text-xs line-clamp-1 mb-2` |
| Footer gap | `gap-3 pt-4` | `gap-2 pt-2` |
| Avatar | `w-7 h-7` | `w-5 h-5` |
| Metadados | `text-xs` | `text-[10px]` |
| Border radius | `rounded-2xl` | `rounded-xl` |
| Grid gap | `gap-6` | `gap-4` |

**Hover color unificado:** todas as páginas usam `hover:border-orange-200` e `group-hover:text-orange-600` — independente do tipo (antes `/guias` usava sky e `/noticias` usava rose).

### 18.3 Card Destaque (Featured) — Permanece Grande

O card de destaque (primeiro artigo `is_featured`) **não foi reduzido** — mantém o layout original:
- Imagem: `h-64 md:h-80` (fullwidth)
- Padding: `p-5 md:p-6`
- Título: `text-xl md:text-2xl font-black`
- Hover: `hover:border-orange-200` (unificado)

### 18.4 Schema.org Article Completo — `/artigo/[slug]`

O Schema.org implementado na página de artigo individual inclui **todos os campos recomendados pelo Google**:

```typescript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": article.type === "Review" ? "Review" : "Article",

  // Campos obrigatórios para rich snippets
  "headline": article.title,                          // max 110 chars
  "description": article.excerpt ?? article.title,

  // Imagem — obrigatório para aparecer no Google Discover
  "image": {
    "@type": "ImageObject",
    "url": article.cover_image,
    "width": 1200,
    "height": 630,
    "caption": article.title,
  },
  "thumbnailUrl": article.cover_image,

  // Autor — Person com URL
  "author": {
    "@type": "Person",
    "name": article.author_name ?? "Mercadoai",
    "url": `https://mercadoai.com/autor/${slugify(article.author_name)}`,
  },

  // Publisher — Organization com logo
  "publisher": {
    "@type": "Organization",
    "name": "Mercadoai",
    "url": "https://mercadoai.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mercadoai.com/logo.png",
    },
  },

  // Datas — crítico para freshness signal do Google
  "datePublished": new Date(article.published_at).toISOString(),
  "dateModified": new Date(article.updated_at).toISOString(),  // ← IMPORTANTE

  // mainEntityOfPage — vincula o schema à URL canônica
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": canonicalUrl,
  },

  // Campos adicionais para rich snippets
  "wordCount": article.content ? article.content.split(" ").length : 800,  // ← wordCount
  "timeRequired": `PT${article.read_time}M`,
  "articleSection": article.subcategory
    ? `${article.category} › ${article.subcategory}`
    : article.category,
  "keywords": article.meta_keywords ?? `${article.category}, ${article.type}`,
  "inLanguage": "pt-BR",
  "url": canonicalUrl,
}
```

**Schemas adicionais na mesma página:**
1. `BreadcrumbList` — com subcategoria se existir (até 5 níveis)
2. `WebPage` — com `@id`, `primaryImageOfPage`, `datePublished`, `dateModified`

---

## 19. Schemas SEO Adicionais (implementados em Abril/2026)

### 19.1 Schema.org Product Completo — `/produto/[slug]`

Implementado na função `ProductSEOHead` em `src/pages/produto/page.tsx`. Replicar em Next.js como Server Component:

```typescript
// app/produto/[slug]/page.tsx — Schema Product completo
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": metaDescription,
  "url": canonicalUrl,
  "image": {
    "@type": "ImageObject",
    "url": product.image_url,
    "width": 800,
    "height": 800,
    "caption": product.name,
  },
  "brand": {
    "@type": "Brand",
    "name": product.brand ?? product.marketplace ?? "Mercadoai",
  },
  "category": product.category,
  "sku": product.id,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock",
    "url": product.affiliate_url ?? canonicalUrl,
    "priceValidUntil": /* 7 dias a partir de hoje */,
    "seller": {
      "@type": "Organization",
      "name": product.marketplace ?? "Mercadoai",
    },
    // Frete grátis — habilita rich snippet de frete no Google
    "shippingDetails": product.free_shipping ? {
      "@type": "OfferShippingDetails",
      "shippingRate": { "@type": "MonetaryAmount", "value": 0, "currency": "BRL" },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "BR" },
    } : undefined,
  },
  // AggregateRating — habilita estrelas nos resultados de busca
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": product.rating,
    "reviewCount": product.review_count,
    "bestRating": 5,
    "worstRating": 1,
  },
  // Specs como PropertyValue — melhora compreensão semântica
  "additionalProperty": Object.entries(product.specs ?? {}).map(([name, value]) => ({
    "@type": "PropertyValue",
    "name": name,
    "value": String(value),
  })),
}

// BreadcrumbList: Home → Produtos → Categoria → Produto
// ItemPage WebPage schema
// Open Graph: product:price:amount e product:price:currency
```

**Meta tags adicionais para produto:**
```html
<meta property="product:price:amount" content="{price}" />
<meta property="product:price:currency" content="BRL" />
```

### 19.2 Schema.org FAQPage — `/artigo/[slug]` tipo Review

Implementado em `ArticleSEOHead` — ativado **apenas quando `article.type === "Review"`**:

```typescript
// Gerado dinamicamente a partir do título do produto
const productName = article.title
  .replace(/^(Review|Análise|Teste):?\s*/i, "")
  .replace(/\s*[-–|].*$/, "")
  .trim();

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": `Vale a pena comprar o ${productName}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": article.excerpt ?? `Análise completa do ${productName} no Mercadoai.`,
      },
    },
    {
      "@type": "Question",
      "name": `Quais são os pontos fortes do ${productName}?`,
      "acceptedAnswer": { "@type": "Answer", "text": "..." },
    },
    {
      "@type": "Question",
      "name": `Onde comprar o ${productName} com melhor preço?`,
      "acceptedAnswer": { "@type": "Answer", "text": "..." },
    },
    {
      "@type": "Question",
      "name": `O ${productName} tem frete grátis?`,
      "acceptedAnswer": { "@type": "Answer", "text": "..." },
    },
  ],
}
```

**Regra:** FAQPage só é emitido para `type === "Review"`. Para Guias de Compra, o FAQPage é gerado na página de listagem `/guias` com base nos títulos dos artigos filtrados.

### 19.3 Schema.org FAQPage — `/guias` (listagem)

Gerado dinamicamente com os primeiros 5 guias filtrados:

```typescript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": filtered.slice(0, 5).map((article) => ({
    "@type": "Question",
    "name": article.title.startsWith("Como") || article.title.startsWith("Qual")
      ? article.title
      : `Como escolher: ${article.title}?`,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": article.excerpt ?? `Guia completo sobre ${article.title} no Mercadoai.`,
      "url": `https://mercadoai.com/artigo/${article.slug}`,
    },
  })),
}
```

### 19.4 Remoção da Rota /comparar

As rotas `/comparar` e `/comparar/:slug` foram **removidas do router público**. Os arquivos físicos (`src/pages/comparar/`) foram mantidos mas não são acessíveis. No Next.js, simplesmente não criar as rotas `app/comparar/` e `app/comparar/[slug]/`.

**Rotas públicas atuais (definitivas):**
```
/                    → Home
/articles            → Lista de artigos
/guias               → Guias de Compra
/noticias            → Notícias
/comparativo         → Lista de comparativos (página editorial)
/products            → Lista de produtos
/ofertas             → Deals ativos
/categoria/:slug     → Produtos por categoria
/produto/:slug       → Detalhe do produto (com Product Schema)
/artigo/:slug        → Artigo individual (com Article/Review + FAQ Schema)
/termos              → Termos de Uso
/privacidade         → Política de Privacidade (LGPD)
```

### 19.5 Schema.org Organization na Home — E-E-A-T do Domínio

Implementado em `src/pages/home/page.tsx` como dois schemas separados:

```typescript
// Organization Schema — fortalece E-E-A-T do domínio
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://mercadoai.com/#organization",
  "name": "Mercadoai",
  "url": "https://mercadoai.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://public.readdy.ai/ai/img_res/3f2f095b-9985-4601-9265-8f102d76ede6.png",
    "width": 400,
    "height": 100,
  },
  "description": "Plataforma brasileira de comparação de preços, reviews e guias de compra de eletrônicos e tecnologia.",
  "foundingDate": "2024",
  "inLanguage": "pt-BR",
  "areaServed": "BR",
  // sameAs: preencher com URLs reais das redes sociais quando disponíveis
  "sameAs": [
    // "https://instagram.com/mercadoai",
    // "https://facebook.com/mercadoai",
    // "https://tiktok.com/@mercadoai",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "contato@mercadoai.com",
    "availableLanguage": "Portuguese",
  },
}

// WebSite Schema — habilita SearchAction (sitelinks search box no Google)
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://mercadoai.com/#website",
  "url": "https://mercadoai.com",
  "name": "Mercadoai",
  "description": "Compare preços, leia reviews e encontre as melhores ofertas de eletrônicos no Brasil.",
  "publisher": { "@id": "https://mercadoai.com/#organization" },
  "inLanguage": "pt-BR",
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://mercadoai.com/products?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
}
```

**Nota:** O campo `sameAs` deve ser atualizado com as URLs reais das redes sociais quando configuradas no admin (`/admin/configuracoes`). No Next.js, buscar as URLs do Supabase (`site_settings`) no Server Component da Home e injetar dinamicamente no `sameAs`.

### 19.6 Tabela `site_settings` — Configurações do Site

Nova tabela criada para gerenciar redes sociais, contato e conteúdo da página Sobre Nós:

```sql
CREATE TABLE site_settings (
  id              TEXT PRIMARY KEY DEFAULT 'main',
  instagram_url   TEXT DEFAULT '',
  whatsapp_url    TEXT DEFAULT '',
  facebook_url    TEXT DEFAULT '',
  tiktok_url      TEXT DEFAULT '',
  contact_email   TEXT DEFAULT '',
  about_title     TEXT DEFAULT 'Sobre o Mercadoai',
  about_content   TEXT DEFAULT '',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: leitura pública, escrita apenas para autenticados
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can update site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
```

**Uso no Next.js:**
- Server Component da Home busca `site_settings` e injeta no `sameAs` do Organization Schema
- Página `/sobrenos` busca `site_settings` para título, conteúdo e links sociais
- Admin `/admin/configuracoes` permite editar todos os campos via UI

### 19.7 Página /sobrenos — Sobre Nós

Nova página pública criada em `/sobrenos` com:
- Schema `AboutPage` com publisher Organization
- Conteúdo dinâmico do banco (`site_settings.about_content`)
- Seção de valores (Imparcialidade, Transparência, Compromisso)
- Seção de contato com e-mail clicável e links sociais
- Links para /termos e /privacidade

**Rota no Next.js:** `app/sobrenos/page.tsx` com ISR (revalidate: 3600)

### 19.8 Admin /admin/configuracoes — Configurações do Site

Nova página admin com 3 abas:
1. **Redes Sociais** — Instagram, WhatsApp, Facebook, TikTok (URLs)
2. **Contato** — E-mail de contato
3. **Sobre Nós** — Título e conteúdo da página /sobrenos (textarea 5000 chars)

Salva em `site_settings` via `upsert` com `id = 'main'`.

### 19.9 Redução do Hero (40%) — Todas as Páginas

O Hero de todas as páginas de listagem foi reduzido em ~40%:

| Antes | Depois |
|-------|--------|
| `pt-32 pb-8` | `pt-20 pb-6` |
| HeroSection Home: `min-h-[260px] md:min-h-[300px]` | `min-h-[156px] md:min-h-[180px]` |

Aplicado em: `/articles`, `/guias`, `/noticias`, `/products`, `/termos`, `/privacidade`, `/sobrenos`, HeroSection da Home.

### 19.10 Footer Atualizado — Links Corretos

Links do Footer corrigidos e atualizados:

| Link | Antes | Depois |
|------|-------|--------|
| Sobre Nós | `/` (quebrado) | `/sobrenos` |
| Contato | `/` (quebrado) | `/sobrenos#contato` |
| Política de Privacidade | `/` (quebrado) | `/privacidade` |
| Termos de Uso | `/` (quebrado) | `/termos` |
| Guias de Compra | `/articles` | `/guias` |
| Reviews de Produtos | `/articles` | `/articles?categoria=Review` |
| Melhores Ofertas | `/products` | `/ofertas` |
| Categorias | `/products` (genérico) | `/categoria/{slug}` (específico) |
| Redes sociais | Ícones estáticos sem href | Links dinâmicos do `site_settings` |
| Rodapé bottom | Links quebrados | `/termos`, `/privacidade`, `/sobrenos` |

### 19.11 Sitemap Atualizado (Abril/2026)

Páginas adicionadas ao sitemap:
- `/sobrenos` — priority 0.7, changefreq monthly
- `/termos` — priority 0.5, changefreq yearly
- `/privacidade` — priority 0.5, changefreq yearly

Páginas removidas do sitemap:
- `/comparar` — rota removida do router público
- `/comparar/{slug}` — rota removida do router público

**Nota:** `/admin/*` são rotas administrativas — **não indexadas** e não incluídas no sitemap.

### 19.12 Sitemap — Regras de Filtragem de Produtos e Artigos (Abril/2026)

**Produtos:** Apenas produtos com `affiliate_url` preenchido e não vazio são incluídos no sitemap. Produto sem link de afiliado não tem utilidade para o usuário que chega pelo Google.

**Artigos — URLs de filtro dinâmicas:** O sitemap gera automaticamente URLs de filtro combinando tipo + subcategoria e tipo + categoria de produto:
- `/articles?categoria=Review&subcategoria=Android` — por tipo + subcategoria
- `/articles?categoria=Review&categoria_produto=Smartphones` — por tipo + categoria de produto

Essas URLs são geradas dinamicamente a partir dos artigos existentes no banco, sem duplicatas.

**Prioridades por tipo de artigo:**
| Tipo | Priority | Changefreq |
|------|----------|------------|
| Notícias | 0.85 | daily |
| Review | 0.82 | monthly |
| Guia de Compra | 0.80 | monthly |
| Comparativo | 0.80 | monthly |
| Outros | 0.75 | monthly |

---

## 20. Refatoração Admin — Ofertas do Dia e Destaques (Abril/2026)

### 20.1 Nova Lógica de Ofertas do Dia

**Antes:** Ofertas do Dia eram cadastradas separadamente na tabela `deals` via `/admin/deals`.

**Depois:** Ofertas do Dia são gerenciadas diretamente nos produtos via campo `is_deal = true`. A tabela `deals` continua existindo mas o fluxo principal mudou.

**Campo adicionado na tabela `products`:**
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deal boolean DEFAULT false;
```

**Como funciona:**
1. No formulário de produto (`/admin/produtos/novo` ou `/admin/produtos/:id`), seção "Configurações", há um toggle **"Oferta do Dia"** com descrição: *"Aparece automaticamente na seção Ofertas do Dia na Home"*
2. Ao ativar, o produto aparece automaticamente na `DealsSection` da Home
3. A `DealsSection` agora busca `products` com `is_deal = true AND is_active = true` (antes buscava da tabela `deals`)
4. O desconto é calculado automaticamente: `((original_price - price) / original_price) * 100`

**Página `/admin/ofertas` (nova):**
- Lista todos os produtos com coluna "Oferta do Dia" (toggle on/off)
- Filtros: Todos / Habilitados / Não Habilitados
- Busca por nome/categoria
- Botão "Editar" redireciona para `/admin/produtos/:id`
- Banner informativo explicando o funcionamento
- Botão "Novo Produto" → `/admin/produtos/novo`

### 20.2 Nova Lógica de Produtos em Destaque

**Antes:** `FeaturedProducts` buscava todos os produtos ativos sem filtro de `is_featured`.

**Depois:** `FeaturedProducts` busca apenas produtos com `is_featured = true AND is_active = true`.

**Como funciona:**
1. No formulário de produto, toggle **"Produto em Destaque"** com descrição: *"Aparece automaticamente na seção Produtos em Destaque na Home"*
2. Tabs de Marketplace na `FeaturedProducts` são geradas **dinamicamente** a partir dos marketplaces dos produtos em destaque (não mais hardcoded)
3. Se não houver produtos em destaque, a seção some automaticamente (sem espaço vazio)

**Página `/admin/destaques` (nova):**
- Mesmo padrão do `/admin/ofertas` mas para `is_featured`
- Toggle "Em Destaque" por produto
- Filtros: Todos / Habilitados / Não Habilitados
- Cor âmbar (vs laranja do /admin/ofertas)

### 20.3 Campo Subcategoria no Formulário de Produto

**Campo adicionado na tabela `products`:**
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory text;
```

**Comportamento no formulário:**
- Campo "Subcategoria" aparece ao lado de "Categoria"
- Subcategorias são filtradas pela categoria selecionada
- Ao trocar a categoria, a subcategoria é resetada automaticamente
- Cada campo (Categoria, Subcategoria, Marketplace, Vendedor) tem botão **"Gerenciar"** que abre modal inline

### 20.4 Tabelas de Lookup Dinâmicas

Novas tabelas criadas para gerenciar Categoria, Subcategoria, Marketplace e Vendedor:

```sql
-- Categorias
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Subcategorias (vinculadas a categoria)
CREATE TABLE subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  category_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, category_id)
);

-- Marketplaces
CREATE TABLE marketplaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Vendedores
CREATE TABLE sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
```

**RLS:** Leitura pública, escrita apenas para autenticados.

**Modal de Gerenciamento (LookupManager):**
- Adicionar novo item (input + botão)
- Editar item existente (inline)
- Excluir item — **bloqueado se vinculado a produto** (verifica antes de deletar)
- Subcategorias: só exibe as da categoria atualmente selecionada no formulário

### 20.5 Filtro de Subcategoria nas Páginas Públicas

**`/products`:**
- Categorias carregadas dinamicamente da tabela `categories`
- Ao selecionar categoria, aparece segunda linha de filtros com subcategorias daquela categoria
- Breadcrumb de filtro ativo: "Mostrando X produtos em Smartphones › Linha S"

**`/categoria/:slug`:**
- Subcategorias aparecem na sidebar (abaixo dos filtros de preço)
- Pills clicáveis: "Todas" + subcategorias da categoria atual
- Integrado ao botão "Limpar Filtros"

### 20.6 Rotas Admin Atualizadas

```
/admin/produtos          → Lista de produtos (com colunas is_deal e is_featured visíveis)
/admin/produtos/novo     → Formulário com Subcategoria + toggles is_deal e is_featured
/admin/produtos/:id      → Editar produto (mesmos campos)
/admin/ofertas           → Gerenciar Ofertas do Dia (is_deal por produto)
/admin/destaques         → Gerenciar Produtos em Destaque (is_featured por produto)
/admin/artigos           → Lista de artigos (sem alteração)
/admin/comparacoes       → Lista de comparações (sem alteração)
/admin/configuracoes     → Configurações do site (redes sociais, contato, sobre nós, FAQs)
```

**Menu lateral (AdminLayout) atualizado:**
```
Dashboard
Produtos            ← filtros: Link, Categoria, Marketplace, Status
Ofertas do Dia      ← toggle is_deal por produto
Destaques           ← toggle is_featured por produto
Artigos             ← filtros: Tipo (pills), Categoria (dropdown)
Comparações
Subcategorias       ← CRUD agrupado por categoria (novo)
Configurações
```

### 20.7 Sitemap — Rotas Admin Excluídas

As rotas `/admin/*` **nunca devem ser incluídas no sitemap**. O `robots.txt` já bloqueia `/admin/` para todos os crawlers. Confirmar no Next.js:

```typescript
// app/robots.ts
rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] }]
```

### 20.8 Submissão no Google Search Console

**Páginas prioritárias para submissão manual (URL Inspection):**
1. `/sobrenos` — FAQPage Schema ativo, rich snippets de FAQ
2. `/` — Organization + WebSite Schema, SearchAction
3. `/artigo/[slug]` tipo Review — FAQPage Schema por artigo
4. `/guias` — FAQPage Schema da listagem

**Como submeter:**
1. Acesse [Google Search Console](https://search.google.com/search-console)
2. Cole a URL no campo "Inspecionar qualquer URL"
3. Clique em "Solicitar indexação"
4. Repita para cada URL prioritária

**Sitemap:** Submeter `https://ucencxnnvtiitpucfnds.supabase.co/functions/v1/sitemap` em Search Console → Sitemaps.

### 19.5 Páginas Legais — /termos e /privacidade

**Por que são importantes para SEO:**
- Google considera sites com Termos e Privacidade mais confiáveis (E-E-A-T)
- Obrigatório para conformidade com LGPD
- Necessário para aprovação em programas de afiliados (Amazon, Mercado Livre)
- Reduz risco de penalização por falta de transparência

**Estrutura das páginas:**
- Hero padrão `pt-32 pb-8 bg-gray-950` (mesmo padrão das listagens)
- Breadcrumb: Home → Termos/Privacidade
- Conteúdo em `max-w-4xl` (mais estreito que as listagens — ideal para leitura)
- Schema `WebPage` com `dateModified`
- Links cruzados entre as duas páginas
- Links no Footer para ambas as páginas

**Conteúdo do /termos:** Sobre o serviço, links de afiliados, precisão das informações, uso aceitável, propriedade intelectual, isenção de responsabilidade, privacidade, alterações, lei aplicável, contato.

**Conteúdo do /privacidade:** Controlador, dados coletados, finalidades, cookies, compartilhamento, direitos LGPD, retenção, segurança, links externos, alterações, DPO/contato.

**Nota sobre `dateModified`:** O campo `updated_at` da tabela `articles` deve ser atualizado automaticamente via trigger no Supabase sempre que o artigo for editado:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
