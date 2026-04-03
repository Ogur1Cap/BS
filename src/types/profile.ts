export interface Profile {
  username: string
  email: string
  phone?: string
  avatar: string
  bio: string
  gamePreference: string
  /** 0=顾客 1=打手，来自后端 users.user_level */
  userLevel?: number
  /** 打手绑定的 players.id 字符串，顾客一般为 null */
  playerProfileId?: string | null
}

