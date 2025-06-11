import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CustomApi implements ICredentialType {
	name = 'customApi';
	displayName = 'Custom LLM API';
	documentationUrl = 'https://github.com/joselhurtado/n8n-nodes-pdf-accessibility/wiki/Custom-LLM-Setup';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your custom LLM API key or token',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://your-llm-api.com/v1',
			description: 'Base URL for your custom LLM API endpoint',
		},
		{
			displayName: 'API Format',
			name: 'apiFormat',
			type: 'options',
			options: [
				{
					name: 'OpenAI Compatible',
					value: 'openai',
					description: 'Uses OpenAI-compatible API format (most common)',
				},
				{
					name: 'Anthropic Compatible',
					value: 'anthropic',
					description: 'Uses Anthropic Claude API format',
				},
				{
					name: 'Custom Format',
					value: 'custom',
					description: 'Custom API format (requires additional configuration)',
				},
			],
			default: 'openai',
			description: 'The API format your LLM service uses',
		},
		{
			displayName: 'Authentication Type',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'Bearer Token',
					value: 'bearer',
					description: 'Authorization: Bearer {token}',
				},
				{
					name: 'API Key Header',
					value: 'apikey',
					description: 'X-API-Key: {key}',
				},
				{
					name: 'Custom Header',
					value: 'custom',
					description: 'Custom authentication header',
				},
			],
			default: 'bearer',
			description: 'How to authenticate with your API',
		},
		{
			displayName: 'Custom Header Name',
			name: 'customHeaderName',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authType: ['custom'],
				},
			},
			placeholder: 'X-Custom-Auth',
			description: 'Name of the custom authentication header',
		},
		{
			displayName: 'Default Model',
			name: 'defaultModel',
			type: 'string',
			default: '',
			placeholder: 'your-model-name',
			description: 'Default model to use for analysis (optional)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'={{$credentials.authType === "bearer" ? "Authorization" : $credentials.authType === "apikey" ? "X-API-Key" : $credentials.customHeaderName}}': '={{$credentials.authType === "bearer" ? "Bearer " + $credentials.apiKey : $credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/health',
			method: 'GET',
		},
	};
}