from typing import List

try:
    from transformers import AutoTokenizer
    transformers_available = True
except ImportError:
    transformers_available = False

_tokenizer_cache = {}

# Mapping des modèles connus → tokenizer HuggingFace
model_to_tokenizer = {
    "Llama-3.1-8B-Instruct": "meta-llama/Meta-Llama-3-8B-Instruct",
    "Meta-Llama-3_3-70B-Instruct": "meta-llama/Meta-Llama-3-70B-Instruct",
    "gpt-3.5-turbo": "gpt2",
    "gpt2": "gpt2"
}

def estimate_token_count(messages: List[dict], model_name: str = "") -> int:
    """
    Estimate token count for a list of prompt messages.
    Uses HuggingFace tokenizer if available and compatible, else fallback to naive estimate.
    """
    if not transformers_available:
        print("[Token Estimation] transformers not installed, using fallback.")
        return naive_token_estimate(messages)

    tokenizer_name = model_to_tokenizer.get(model_name)
    if not tokenizer_name:
        print(f"[Token Estimation] No tokenizer mapping for model '{model_name}', using fallback.")
        return naive_token_estimate(messages)

    try:
        if tokenizer_name not in _tokenizer_cache:
            _tokenizer_cache[tokenizer_name] = AutoTokenizer.from_pretrained(tokenizer_name)
        tokenizer = _tokenizer_cache[tokenizer_name]
    except Exception as e:
        print(f"[Token Estimation] Failed to load tokenizer for {model_name}: {e}")
        return naive_token_estimate(messages)

    total_tokens = 0
    for msg in messages:
        content = msg.get("content", "")
        role = msg.get("role", "")
        tokens = tokenizer.encode(role + ": " + content, add_special_tokens=False)
        total_tokens += len(tokens)
    return total_tokens

def naive_token_estimate(messages: List[dict]) -> int:
    """
    Fallback if tokenizer is unavailable. Rough estimation: 1 token ≈ 4 chars
    """
    total_chars = sum(len(msg.get("role", "")) + len(msg.get("content", "")) for msg in messages)
    return total_chars // 4
