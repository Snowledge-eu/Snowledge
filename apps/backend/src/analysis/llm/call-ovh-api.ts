import fetch from 'node-fetch';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OvhClient {
  async callOvhApi(payload: any, stream = false): Promise<any> {
    const url =
      process.env.OVH_API_BASE_URL ||
      'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions';
    const token = process.env.OVH_AI_ENDPOINTS_ACCESS_TOKEN;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OVH API error: ${res.status} - ${errText}`);
    }

    return res.json();
  }
}
