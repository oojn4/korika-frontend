export interface ClientInputArticle {
  article_category_id: string
  title: string
  contents: string
  tags: string[]
  cover_image: File | null
}

export interface Article {
  id: string
  title: string
  slug: string
  img: string
  category: string | null
  content: string
  creator: {
    id: string
    name: string
  },
  viewer_count: number
  like_count: number
  is_shown: number
  is_approved: number
  responded_by: {
    id: string
    name: string
  }
  responded_at: string
  response_notes: null | string
  created_at: string
  updated_at: string
}

export interface ArticleResponse {
  status: string
  timestamp: string
  data: Article[]
}

export interface ShowArticleResponse {
  success: string
  data: Article
}