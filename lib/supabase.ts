import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://qjukpzpvbxajiawdlcxo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdWtwenB2Ynhhamlhd2RsY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODA2MjksImV4cCI6MjA3MzQ1NjYyOX0.aJMbToTrs2jypBVM_b4LsR2dgAIxXquS1huLViUgu0Y'

// 使用 service role key 进行服务端操作
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 数据库表类型定义
export interface License {
  id: string
  license_key: string
  product_id?: string
  start_time: string
  end_time: string
  status: 'active' | 'revoked' | 'expired'
  max_activations: number
  created_at: string
  updated_at: string
  note?: string
}

export interface Activation {
  id: string
  license_id: string
  device_id: string
  device_info?: string
  activated_at: string
  unbound_at?: string
}

export interface LicenseLog {
  id: string
  license_id: string
  action: 'validate' | 'activate' | 'revoke' | 'expire' | 'unbind'
  result: 'success' | 'fail'
  detail?: string
  operator?: string
  ip?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  created_at: string
}
