import type { PreTrainedTokenizer } from '@xenova/transformers';

const modelToTokenizer: Record<string, string> = {
	'Llama-3.1-8B-Instruct': 'meta-llama/Meta-Llama-3-8B-Instruct',
	'Meta-Llama-3_3-70B-Instruct': 'meta-llama/Meta-Llama-3-70B-Instruct',
	'gpt-3.5-turbo': 'gpt2', // approximation
	'gpt2': 'gpt2'
};

const tokenizerCache: Record<string, PreTrainedTokenizer> = {};

type Message = {
  role: string;
  content: string;
};

async function loadTokenizer(modelName: string): Promise<PreTrainedTokenizer | null> {
	const identifier = modelToTokenizer[modelName];
	if (!identifier) return null;

	if (tokenizerCache[identifier]) return tokenizerCache[identifier];

	try {
		const { AutoTokenizer } = await import('@xenova/transformers');
		const tokenizer = await AutoTokenizer.from_pretrained(identifier);
		tokenizerCache[identifier] = tokenizer;
		return tokenizer;
	} catch (err) {
		console.warn(`[TokenUtils] Failed to load tokenizer for model "${modelName}"`, err);
		return null;
	}
}

function naiveTokenEstimate(messages: Message[]): number {
	const charCount = messages.reduce(
		(sum, msg) => sum + msg.role.length + msg.content.length,
		0
	);
	return Math.floor(charCount / 4);
}

export async function estimateTokenCount(
	messages: Message[],
	modelName: string
	): Promise<number> {
	const tokenizer = await loadTokenizer(modelName);
	if (!tokenizer) return naiveTokenEstimate(messages);

	let total = 0;
	for (const msg of messages) {
		const encoded = await tokenizer.encode(`${msg.role}: ${msg.content}`);
		total += encoded.length;
	}
	return total;
}
