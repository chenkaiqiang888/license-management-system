"""
授权客户端 Python SDK
用于 Python 应用程序集成授权验证功能
"""

import requests
import json
import hashlib
import platform
import uuid
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any


class LicenseClient:
    def __init__(self, api_url: str = None, license_key: str = None):
        self.api_url = api_url or 'https://your-domain.vercel.app/api'
        self.license_key = license_key
        self.device_id = None
        self.token = None
        self.token_expiry = None
        self.refresh_interval = None
        self.on_token_expired = None
        self.on_validation_failed = None

    def generate_device_id(self) -> str:
        """生成设备指纹"""
        # 收集设备信息
        device_info = [
            platform.node(),  # 主机名
            platform.machine(),  # 机器类型
            platform.processor(),  # 处理器
            platform.system(),  # 操作系统
            str(uuid.getnode()),  # MAC地址
        ]
        
        # 生成唯一标识
        device_string = '|'.join(device_info)
        return hashlib.md5(device_string.encode()).hexdigest()

    def validate_license(self, license_key: str = None) -> Dict[str, Any]:
        """验证授权码"""
        try:
            self.license_key = license_key or self.license_key
            if not self.license_key:
                return {'success': False, 'error': '授权码不能为空'}

            self.device_id = self.device_id or self.generate_device_id()

            # 准备请求数据
            data = {
                'licenseKey': self.license_key,
                'deviceId': self.device_id,
                'deviceInfo': {
                    'platform': platform.platform(),
                    'system': platform.system(),
                    'machine': platform.machine(),
                    'processor': platform.processor(),
                    'python_version': platform.python_version(),
                }
            }

            # 发送验证请求
            response = requests.post(
                f'{self.api_url}/validate',
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )

            result = response.json()

            if result.get('success'):
                self.token = result['data']['token']
                # 假设token有效期为12小时
                self.token_expiry = datetime.now() + timedelta(hours=12)
                
                return {
                    'success': True,
                    'license': result['data']['license'],
                    'device_id': result['data']['device_id']
                }
            else:
                error_msg = result.get('error', '验证失败')
                if self.on_validation_failed:
                    self.on_validation_failed(error_msg)
                return {'success': False, 'error': error_msg}

        except requests.exceptions.RequestException as e:
            error_msg = f'网络错误: {str(e)}'
            if self.on_validation_failed:
                self.on_validation_failed(error_msg)
            return {'success': False, 'error': error_msg}
        except Exception as e:
            error_msg = f'验证过程中发生错误: {str(e)}'
            if self.on_validation_failed:
                self.on_validation_failed(error_msg)
            return {'success': False, 'error': error_msg}

    def is_authorized(self) -> bool:
        """检查当前授权状态"""
        if not self.token or not self.token_expiry:
            return False
        return datetime.now() < self.token_expiry

    def get_license_info(self) -> Optional[Dict[str, Any]]:
        """获取当前授权信息"""
        if not self.is_authorized():
            return None

        return {
            'license_key': self.license_key,
            'device_id': self.device_id,
            'token': self.token,
            'expires_at': self.token_expiry
        }

    def refresh_token(self) -> bool:
        """刷新token"""
        if not self.license_key or not self.device_id:
            return False

        try:
            result = self.validate_license()
            if result['success'] and self.on_token_expired:
                self.on_token_expired()
            return result['success']
        except Exception as e:
            print(f'Token刷新失败: {e}')
            if self.on_token_expired:
                self.on_token_expired()
            return False

    def start_auto_refresh(self, interval_hours: int = 6):
        """启动自动刷新（需要配合外部定时器使用）"""
        self.refresh_interval = interval_hours

    def destroy(self):
        """销毁客户端"""
        self.token = None
        self.token_expiry = None
        self.license_key = None
        self.device_id = None
        self.refresh_interval = None


# 使用示例
if __name__ == '__main__':
    # 创建客户端实例
    client = LicenseClient(
        api_url='https://your-domain.vercel.app/api',
        license_key='YOUR_LICENSE_KEY'
    )

    # 设置回调函数
    def on_token_expired():
        print('授权已过期，请重新验证')

    def on_validation_failed(error):
        print(f'授权验证失败: {error}')

    client.on_token_expired = on_token_expired
    client.on_validation_failed = on_validation_failed

    # 验证授权
    result = client.validate_license()
    if result['success']:
        print('授权验证成功！')
        print(f'设备ID: {result["device_id"]}')
        print(f'授权信息: {result["license"]}')
        
        # 检查授权状态
        if client.is_authorized():
            print('当前已授权')
            license_info = client.get_license_info()
            print(f'授权详情: {license_info}')
        else:
            print('当前未授权')
    else:
        print(f'授权验证失败: {result["error"]}')

