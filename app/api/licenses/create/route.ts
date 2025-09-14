import { NextRequest, NextResponse } from 'next/server'
import { supabase, License } from '@/lib/supabase'
import { generateLicenseKey } from '@/lib/jwt'
import { getClientIP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      productId, 
      startTime, 
      endTime, 
      maxActivations = 1, 
      note 
    } = body

    // 验证必填字段
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: '开始时间和结束时间不能为空' },
        { status: 400 }
      )
    }

    // 验证时间范围
    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        { error: '结束时间必须晚于开始时间' },
        { status: 400 }
      )
    }

    // 生成唯一授权码
    let licenseKey: string
    let isUnique = false
    
    while (!isUnique) {
      licenseKey = generateLicenseKey()
      const { data: existing } = await supabase
        .from('licenses')
        .select('id')
        .eq('license_key', licenseKey)
        .single()
      
      if (!existing) {
        isUnique = true
      }
    }

    // 如果提供了产品ID，先检查产品是否存在，如果不存在则创建
    let finalProductId = null
    if (productId && productId.trim()) {
      // 先查询是否存在同名产品
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('name', productId.trim())
        .single()
      
      if (existingProduct) {
        finalProductId = existingProduct.id
      } else {
        // 创建新产品
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            name: productId.trim(),
            description: `产品: ${productId.trim()}`
          })
          .select()
          .single()
        
        if (productError) {
          console.error('创建产品失败:', productError)
          // 如果创建产品失败，继续创建授权但不关联产品
        } else {
          finalProductId = newProduct.id
        }
      }
    }

    // 创建授权记录
    const { data: license, error } = await supabase
      .from('licenses')
      .insert({
        license_key: licenseKey!,
        product_id: finalProductId,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        max_activations: parseInt(maxActivations.toString()),
        note: note || null,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('创建授权失败:', error)
      return NextResponse.json(
        { error: `创建授权失败: ${error.message}` },
        { status: 500 }
      )
    }

    // 记录日志
    const clientIP = getClientIP(request)
    await supabase
      .from('license_logs')
      .insert({
        license_id: license.id,
        action: 'create',
        result: 'success',
        detail: `创建授权码: ${license.license_key}`,
        operator: 'admin',
        ip: clientIP
      })

    return NextResponse.json({
      success: true,
      data: license
    })

  } catch (error) {
    console.error('创建授权异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
