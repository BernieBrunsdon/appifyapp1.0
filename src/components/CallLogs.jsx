import React, { useEffect, useState, useMemo } from 'react';

const API_URL = 'https://api.vapi.ai/call';
const API_KEY = '00c60c9f-62b3-4dd3-bede-036242a2b7c5';

const STATUS_LABELS = {
	pass: 'Pass',
	fail: 'Fail',
	transferred: 'Transferred',
	n_a: 'N/A',
};

const ENDED_REASON_LABELS = {
	'customer-ended': 'Customer Ended Call',
	'no-microphone-permission': 'No Microphone Permission',
	// Add more mappings as needed
};

function formatDateTime(dt) {
	if (!dt) return 'N/A';
	const d = new Date(dt);
	return d.toLocaleString();
}

function formatDuration(start, end) {
	if (!start || !end) return 'N/A';
	const s = new Date(start);
	const e = new Date(end);
	const sec = Math.floor((e - s) / 1000);
	if (isNaN(sec) || sec < 0) return 'N/A';
	if (sec < 60) return `${sec}s`;
	const min = Math.floor(sec / 60);
	return `${min}m ${sec % 60}s`;
}

function formatCost(cost) {
	if (cost == null) return '$0.00';
	return `$${Number(cost).toFixed(2)}`;
}

const columns = [
	{ key: 'id', label: 'Call ID', short: true },
	{ key: 'assistant', label: 'Assistant' },
	{ key: 'assistantPhone', label: 'Assistant Phone Number' },
	{ key: 'customerPhone', label: 'Customer Phone Number' },
	{ key: 'endedReason', label: 'Ended Reason' },
	{ key: 'successEvaluation', label: 'Success Evaluation' },
	{ key: 'startTime', label: 'Start Time' },
	{ key: 'duration', label: 'Duration' },
	{ key: 'cost', label: 'Cost' },
];

export default function CallLogs({ showToast }) {
	const [calls, setCalls] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedAssistantKey, setSelectedAssistantKey] = useState('');

	const startWebCall = async (assistantId, assistantPhone) => {
		try {
			if (assistantId) {
				if (!window.__vapiClient) {
					const mod = await import('@vapi-ai/web');
					const Vapi = mod.default || mod;
					window.__vapiClient = new Vapi(process.env.REACT_APP_VAPI_PUBLIC_KEY || '');
				}
				await window.__vapiClient.start(assistantId);
				showToast && showToast('Starting test web call...');
				return;
			}
			if (assistantPhone) {
				window.location.href = `tel:${assistantPhone}`;
				return;
			}
			showToast && showToast('No assistant id or phone number available.');
		} catch (err) {
			showToast && showToast(`Failed to start call: ${err.message || err}`);
		}
	};

	useEffect(() => {
		if (!API_KEY) {
			setError('Missing REACT_APP_VAPI_API_KEY. Add it to app/.env and restart the dev server.');
			setLoading(false);
			return;
		}
		setLoading(true);
		fetch(API_URL + '?limit=100', {
			headers: {
				Authorization: `Bearer ${API_KEY}`,
			},
		})
			.then((res) => {
				if (!res.ok) {
					if (res.status === 401) throw new Error('Unauthorized (401). Ensure the Private key belongs to the same Vapi workspace as your calls.');
					throw new Error(`Failed to fetch call logs (status ${res.status}).`);
				}
				return res.json();
			})
			.then((data) => {
				setCalls(Array.isArray(data) ? data : data.items || []);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

	// Unique assistant options from loaded calls
	const assistantOptions = useMemo(() => {
		const map = new Map();
		for (const c of calls) {
			const id = c.assistant?.id || c.assistantId || '';
			const phone = c.assistant?.phoneNumber || '';
			const key = id || phone; // prefer id
			if (!key) continue;
			if (!map.has(key)) {
				map.set(key, {
					key,
					id: id || '',
					phone: phone || '',
					name: c.assistant?.name || (id ? 'Assistant' : phone ? `Phone ${phone}` : 'Assistant'),
				});
			}
		}
		return Array.from(map.values());
	}, [calls]);

	useEffect(() => {
		if (!selectedAssistantKey && assistantOptions.length > 0) {
			setSelectedAssistantKey(assistantOptions[0].key);
		}
	}, [assistantOptions, selectedAssistantKey]);

	const selectedAssistant = assistantOptions.find((o) => o.key === selectedAssistantKey);

	// Stats
	const total = calls.length;
	const successful = calls.filter((c) => c.analysis?.successEvaluation === 'pass').length;
	const failed = calls.filter((c) => c.analysis?.successEvaluation === 'fail').length;
	const transferred = calls.filter((c) => c.endedReason === 'transferred').length;

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Beautiful Gradient Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
			<div className="absolute inset-0 bg-gradient-to-tr from-pink-900/20 via-purple-900/20 to-blue-900/20"></div>
			
			{/* Animated Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
			</div>

			<div className="relative z-10 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-8">
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">Call Logs</h1>
						<p className="text-gray-400 text-lg">View and manage your AI agent call history</p>
					</div>

					<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
						<h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
							<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							Call Analytics
						</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							<div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
								<div className="text-2xl font-bold text-blue-400">{total}</div>
								<div className="text-sm text-gray-300">Total Calls</div>
							</div>
							<div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
								<div className="text-2xl font-bold text-green-400">{successful}</div>
								<div className="text-sm text-gray-300">Successful</div>
							</div>
							<div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
								<div className="text-2xl font-bold text-yellow-400">{transferred}</div>
								<div className="text-sm text-gray-300">Transferred</div>
							</div>
							<div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
								<div className="text-2xl font-bold text-red-400">{failed}</div>
								<div className="text-sm text-gray-300">Failed</div>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<label className="text-sm text-gray-300">Select assistant:</label>
							<select
								className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
								value={selectedAssistantKey}
								onChange={(e) => setSelectedAssistantKey(e.target.value)}
							>
								{assistantOptions.length === 0 ? (
									<option value="" className="bg-gray-800 text-white">No assistants found</option>
								) : (
									assistantOptions.map((o) => (
										<option key={o.key} value={o.key} className="bg-gray-800 text-white">{o.name}</option>
									))
								)}
							</select>
							<button
								onClick={() => selectedAssistant && startWebCall(selectedAssistant.id, selectedAssistant.phone)}
								disabled={!selectedAssistant}
								className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
							>
								Call Now
							</button>
						</div>
						<div className="text-gray-400 text-sm mt-3">Note: Web calls require microphone permission. If unavailable, the call will attempt via phone when a number is present.</div>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 overflow-x-auto">
						<div className="mb-4 flex flex-wrap gap-2">
							{columns.map((col) => (
								<span key={col.key} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-300">{col.label}</span>
							))}
						</div>
						{loading ? (
							<div className="text-center py-12">
								<div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
								<div className="text-lg text-gray-300">Loading call logs...</div>
							</div>
						) : error ? (
							<div className="text-center py-12">
								<div className="text-lg text-red-400 mb-2">Error loading call logs</div>
								<div className="text-sm text-gray-400">{error}</div>
							</div>
						) : (
							<table className="w-full text-left">
								<thead>
									<tr>
										{columns.map((col) => (
											<th key={col.key} className="py-3 px-4 text-sm font-bold text-gray-300 border-b border-white/20">{col.label}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{calls.map((call) => (
										<tr key={call.id} className="hover:bg-white/5 transition-all border-b border-white/10">
											<td className="py-3 px-4 font-mono text-sm text-gray-300 max-w-[120px] truncate">
												{call.id}
											</td>
											<td className="py-3 px-4 text-gray-300">{call.assistant?.name || 'N/A'}</td>
											<td className="py-3 px-4 text-gray-300">{call.assistant?.phoneNumber || 'N/A'}</td>
											<td className="py-3 px-4 text-gray-300">{call.customer?.phoneNumber || 'Web'}</td>
											<td className="py-3 px-4">
												<span className={`px-3 py-1 rounded-lg text-xs font-semibold ${call.endedReason === 'no-microphone-permission' ? 'bg-red-500/80 text-white' : 'bg-emerald-700/80 text-emerald-100'}`}>
													{ENDED_REASON_LABELS[call.endedReason] || call.endedReason || 'N/A'}
												</span>
											</td>
											<td className="py-3 px-4">
												<span className={`px-3 py-1 rounded-lg text-xs font-semibold ${call.analysis?.successEvaluation === 'fail' ? 'bg-red-500/80 text-white' : call.analysis?.successEvaluation === 'pass' ? 'bg-green-600/80 text-white' : 'bg-gray-500/80 text-white'}`}>
													{STATUS_LABELS[call.analysis?.successEvaluation] || 'N/A'}
												</span>
											</td>
											<td className="py-3 px-4 text-gray-300">{formatDateTime(call.startedAt)}</td>
											<td className="py-3 px-4 text-gray-300">{formatDuration(call.startedAt, call.endedAt)}</td>
											<td className="py-3 px-4 text-gray-300">{formatCost(call.cost)}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>
		</div>
	);
} 