import json
import requests
import yaml
from pathlib import Path
from typing import Union, Generator, Optional, Dict
from config.config import get_env_var

def load_yaml(file_path: str) -> dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def get_model_config(model_name: str) -> dict:
    llm_path = Path(__file__).parent / 'llm_models.yaml'
    config = load_yaml(str(llm_path))
    for section in ['llm_models', 'lrm_models', 'vlm_models']:
        for model in config.get(section, []):
            if model.get('name') == model_name:
                return model
    raise ValueError(f"Model '{model_name}' not found in llm_models.yaml.")

def get_prompt_config(prompt_name: str) -> dict:
    prompt_path = Path(__file__).parent / 'prompt_models.yaml'
    config = load_yaml(str(prompt_path))
    prompts = config.get('prompt_models', {})
    if prompt_name not in prompts:
        raise ValueError(f"Prompt '{prompt_name}' not found in prompt_models.yaml.")
    return prompts[prompt_name]

def build_payload_for_content(
    model_config: dict,
    prompt_config: dict,
    trend: dict,
    stream: bool = False,
    extra: Optional[dict] = None
) -> dict:
    # On insère l'objet trend dans le prompt via {{trend}}
    trend_json = json.dumps(trend, indent=2, ensure_ascii=False)

    messages = []
    for msg in prompt_config.get('messages', []):
        content = msg['content'].replace("{{trend}}", trend_json)
        messages.append({
            'role': msg['role'],
            'content': content
        })

    payload = {
        'max_tokens': model_config.get('context_window', 512),
        'messages': messages,
        'model': model_config['name'],
        'temperature': prompt_config.get('temperature', model_config.get('temperature', 0.3)),
        'top_p': prompt_config.get('top_p', model_config.get('top_p', 0.8)),
        'stream': stream
    }

    if 'response_format' in prompt_config:
        payload['response_format'] = prompt_config['response_format']

    if extra:
        payload.update(extra)

    return payload

def call_ovh_api(payload: dict, stream: bool = False) -> Union[dict, Generator[str, None, None]]:
    url = get_env_var('OVH_API_BASE_URL', 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions')
    token = get_env_var('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.post(url, json=payload, headers=headers, stream=stream, timeout=60)

    if stream:
        def stream_generator():
            for line in response.iter_lines():
                if line:
                    yield line.decode('utf-8')
        return stream_generator()
    else:
        if response.status_code == 200:
            return response.json()
        else:
            raise RuntimeError(f"OVH API error: {response.status_code} - {response.text}")

def trend_to_content(
    model_name: str,
    prompt_name: str,
    trend: Dict,
    stream: bool = False,
    extra: Optional[dict] = None
) -> Union[dict, Generator[str, None, None]]:
    model_config = get_model_config(model_name)
    prompt_config = get_prompt_config(prompt_name)
    payload = build_payload_for_content(model_config, prompt_config, trend, stream=stream, extra=extra)
    return call_ovh_api(payload, stream=stream)
