import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AnthropicApi implements ICredentialType {
	name = 'anthropicApi';
	displayName = 'Anthropic API';
	documentationUrl = 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
			placeholder: 'sk-ant-api...',
			description: 'The API key for your Anthropic account',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
				'anthropic-version': '2023-06-01',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.anthropic.com/v1',
			url: '/messages',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				model: 'claude-3-haiku-20240307',
				max_tokens: 10,
				messages: [
					{
						role: 'user',
						content: 'Test',
					},
				],
			},
		},
	};
}