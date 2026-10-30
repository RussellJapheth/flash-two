<script lang="ts">
	interface Props {
		name?: string;
		role?: string;
		avatarUrl?: string;
		avatarEmoji?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		className?: string;
	}

	let {
		name = '',
		role = '',
		avatarUrl = '',
		avatarEmoji = '',
		size = 'md',
		className = ''
	}: Props = $props();

	// Size dimension classes
	const sizeClasses: Record<string, string> = {
		xs: 'w-5 h-5',
		sm: 'w-9 h-9',
		md: 'w-11 h-11',
		lg: 'w-14 h-14',
		xl: 'w-16 h-16'
	};

	type AvatarType =
		| 'xiao-ming'
		| 'david'
		| 'chef'
		| 'shopkeeper'
		| 'teacher'
		| 'driver'
		| 'auntie-mei'
		| 'mom'
		| 'son'
		| 'tea-master'
		| 'station-officer'
		| 'doctor'
		| 'master-liu'
		| 'xiao-bo'
		| 'traveler'
		| 'friend'
		| 'default';

	const avatarType = $derived<AvatarType>(getAvatarType(name, role));

	function getAvatarType(charName: string, charRole: string): AvatarType {
		const target = `${charName} ${charRole}`.toLowerCase();

		// Specific character names have highest priority for 100% consistency
		if (target.includes('minmin') || target.includes('敏敏')) return 'xiao-ming';
		if (target.includes('xiaoli') || target.includes('小李')) return 'friend';
		if (target.includes('david') || target.includes('大卫')) return 'david';
		if (
			target.includes('wang') ||
			target.includes('王阿姨') ||
			target.includes('auntie mei') ||
			target.includes('梅阿姨')
		)
			return 'auntie-mei';
		if (target.includes('xiao ming') || target.includes('小明')) return 'xiao-ming';
		if (
			target.includes('linna') ||
			target.includes('琳娜') ||
			target.includes('anna') ||
			target.includes('安娜')
		)
			return 'friend';
		if (
			target.includes('chef') ||
			target.includes('厨师') ||
			target.includes('lao wang') ||
			target.includes('老王')
		)
			return 'chef';
		if (
			target.includes('shopkeeper') ||
			target.includes('clerk') ||
			target.includes('林阿姨') ||
			target.includes('摊主') ||
			target.includes('收银员') ||
			target.includes('barista') ||
			target.includes('咖啡师') ||
			target.includes('xiaoli') ||
			target.includes('小李')
		)
			return 'shopkeeper';
		if (
			target.includes('teacher') ||
			target.includes('于老师') ||
			target.includes('王老师') ||
			target.includes('李老师') ||
			target.includes('li') ||
			target.includes('yu')
		)
			return 'teacher';
		if (
			target.includes('driver') ||
			target.includes('captain') ||
			target.includes('chen') ||
			target.includes('张师傅') ||
			target.includes('司机')
		)
			return 'driver';
		if (
			target.includes('auntie mei') ||
			target.includes('梅阿姨') ||
			target.includes('wang') ||
			target.includes('王阿姨')
		)
			return 'auntie-mei';
		if (
			target.includes('mom') ||
			target.includes('mommy') ||
			target.includes('妈妈') ||
			target.includes('张妈妈')
		)
			return 'mom';
		if (target.includes('son') || target.includes('儿子') || target.includes('boy')) return 'son';
		if (
			target.includes('tea') ||
			target.includes('茶') ||
			target.includes('ling') ||
			target.includes('令师傅') ||
			target.includes('xiao xue') ||
			target.includes('小雪')
		)
			return 'tea-master';
		if (
			target.includes('station') ||
			target.includes('officer') ||
			target.includes('列车员') ||
			target.includes('警官') ||
			target.includes('conductor')
		)
			return 'station-officer';
		if (
			target.includes('dr.') ||
			target.includes('doctor') ||
			target.includes('医生') ||
			target.includes('dr. yin') ||
			target.includes('博士')
		)
			return 'doctor';
		if (target.includes('master liu') || target.includes('刘师傅')) return 'master-liu';
		if (target.includes('xiao bo') || target.includes('小博') || target.includes('techie'))
			return 'xiao-bo';
		if (
			target.includes('traveler') ||
			target.includes('customer') ||
			target.includes('buyer') ||
			target.includes('passenger') ||
			target.includes('learner') ||
			target.includes('背包客') ||
			target.includes('买家')
		)
			return 'traveler';
		if (
			target.includes('friend') ||
			target.includes('guest') ||
			target.includes('student') ||
			target.includes('小丽') ||
			target.includes('小宇') ||
			target.includes('敏敏') ||
			target.includes('minmin')
		)
			return 'friend';

		return 'default';
	}
</script>

<div
	class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-indigo-200/80 bg-linear-to-b from-indigo-50/70 via-white to-amber-50/50 shadow-xs {sizeClasses[
		size
	] || sizeClasses.md} {className}"
	title={name || role || 'Illustrated Avatar'}
	role="img"
	aria-label={name || role || 'Character avatar'}
>
	{#if avatarUrl}
		<img src={avatarUrl} alt={name || role} class="h-full w-full object-cover" />
	{:else if avatarType === 'default' && avatarEmoji}
		<div
			class="flex h-full w-full items-center justify-center bg-linear-to-tr from-amber-50 to-indigo-50 text-xl select-none"
		>
			<span>{avatarEmoji}</span>
		</div>
	{:else}
		<svg viewBox="0 0 100 100" class="h-full w-full select-none" xmlns="http://www.w3.org/2000/svg">
			<!-- Background Vignette Circle -->
			<defs>
				<linearGradient id="warmBg" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#F8FAFC" />
					<stop offset="100%" stop-color="#EEF2FF" />
				</linearGradient>
				<linearGradient id="skinBase" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#FED7AA" />
					<stop offset="100%" stop-color="#FDBA74" />
				</linearGradient>
				<linearGradient id="blondHair" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#FDE047" />
					<stop offset="100%" stop-color="#CA8A04" />
				</linearGradient>
				<linearGradient id="darkHair" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#334155" />
					<stop offset="100%" stop-color="#0F172A" />
				</linearGradient>
				<linearGradient id="indigoSuit" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#6366F1" />
					<stop offset="100%" stop-color="#4338CA" />
				</linearGradient>
				<linearGradient id="emeraldShirt" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#10B981" />
					<stop offset="100%" stop-color="#047857" />
				</linearGradient>
				<linearGradient id="amberShirt" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#F59E0B" />
					<stop offset="100%" stop-color="#B45309" />
				</linearGradient>
				<linearGradient id="roseKnit" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#F43F5E" />
					<stop offset="100%" stop-color="#BE123C" />
				</linearGradient>
			</defs>

			{#if avatarType === 'xiao-ming'}
				<!-- Xiao Ming (Friendly Student, dark side-swept hair, collegiate blue polo) -->
				<!-- Shoulders / Torso -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="url(#indigoSuit)" />
				<path d="M42 68 L50 82 L58 68 Z" fill="#FFFFFF" />
				<path d="M48 68 L50 78 L52 68 Z" fill="#CBD5E1" />
				<path d="M28 80 L35 100" stroke="#3730A3" stroke-width="4" stroke-linecap="round" />
				<!-- Neck -->
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<!-- Head -->
				<ellipse cx="50" cy="42" rx="19" ry="21" fill="url(#skinBase)" />
				<!-- Ears -->
				<circle cx="31" cy="43" r="4.5" fill="url(#skinBase)" />
				<circle cx="69" cy="43" r="4.5" fill="url(#skinBase)" />
				<!-- Cheeks blush -->
				<circle cx="39" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
				<circle cx="61" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
				<!-- Eyes & Eyebrows -->
				<path
					d="M38 37 Q42 35 44 37"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M56 37 Q58 35 62 37"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="41" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="42" cy="40" r="0.8" fill="#FFFFFF" />
				<circle cx="60" cy="40" r="0.8" fill="#FFFFFF" />
				<!-- Smile -->
				<path
					d="M45 49 Q50 54 55 49"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Hair (Swept bangs) -->
				<path
					d="M30 40 C28 26, 42 17, 56 17 C68 17, 72 26, 71 38 C67 30, 58 26, 48 27 C40 28, 35 32, 30 40 Z"
					fill="url(#darkHair)"
				/>
				<path d="M32 32 C38 24, 48 23, 56 24 C50 29, 44 35, 38 38 Z" fill="#1E293B" />
			{:else if avatarType === 'david'}
				<!-- David (International traveler, wavy blond hair, green explorer collar) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 100, 78 100 Z" fill="url(#emeraldShirt)" />
				<path d="M40 68 L50 84 L60 68 Z" fill="#FEF3C7" />
				<path d="M46 72 L50 80 L54 72 Z" fill="#F59E0B" />
				<!-- Neck -->
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<!-- Head -->
				<ellipse cx="50" cy="42" rx="19" ry="21" fill="url(#skinBase)" />
				<circle cx="31" cy="43" r="4.5" fill="url(#skinBase)" />
				<circle cx="69" cy="43" r="4.5" fill="url(#skinBase)" />
				<!-- Cheeks blush -->
				<circle cx="39" cy="46" r="3.5" fill="#FB7185" opacity="0.35" />
				<circle cx="61" cy="46" r="3.5" fill="#FB7185" opacity="0.35" />
				<!-- Eyes & Eyebrows -->
				<path
					d="M37 36 Q42 34 45 36"
					stroke="#92400E"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M55 36 Q58 34 63 36"
					stroke="#92400E"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="41" cy="41" r="2.2" fill="#0284C7" />
				<circle cx="59" cy="41" r="2.2" fill="#0284C7" />
				<circle cx="42" cy="40" r="0.8" fill="#FFFFFF" />
				<circle cx="60" cy="40" r="0.8" fill="#FFFFFF" />
				<!-- Smile -->
				<path
					d="M44 49 Q50 55 56 49"
					stroke="#92400E"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Wavy blond hair -->
				<path
					d="M28 38 C26 22, 40 16, 50 16 C66 16, 74 24, 72 40 C68 31, 62 25, 52 26 C42 27, 34 31, 28 38 Z"
					fill="url(#blondHair)"
				/>
				<circle cx="33" cy="27" r="6" fill="#FACC15" />
				<circle cx="67" cy="27" r="6" fill="#FACC15" />
			{:else if avatarType === 'chef'}
				<!-- Chef Lao Wang (White chef toque, cheerful mustache, red neckerchief) -->
				<!-- Torso / Chef Coat -->
				<path
					d="M22 100 C22 75, 35 70, 50 70 C65 70, 78 75, 78 100 Z"
					fill="#F8FAFC"
					stroke="#E2E8F0"
					stroke-width="1.5"
				/>
				<!-- Red Neckerchief -->
				<path d="M42 66 L50 82 L58 66 Z" fill="#E11D48" />
				<circle cx="50" cy="74" r="3" fill="#BE123C" />
				<!-- Buttons -->
				<circle cx="54" cy="88" r="2" fill="#94A3B8" />
				<circle cx="54" cy="95" r="2" fill="#94A3B8" />
				<!-- Neck -->
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<!-- Head -->
				<ellipse cx="50" cy="46" rx="20" ry="20" fill="url(#skinBase)" />
				<circle cx="30" cy="47" r="4" fill="url(#skinBase)" />
				<circle cx="70" cy="47" r="4" fill="url(#skinBase)" />
				<!-- Eyes (happy laughing arcs) -->
				<path
					d="M37 42 Q42 38 45 42"
					stroke="#0F172A"
					stroke-width="2.5"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M55 42 Q58 38 63 42"
					stroke="#0F172A"
					stroke-width="2.5"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Cheerful Mustache -->
				<path d="M40 54 Q48 50 50 54 Q52 50 60 54 Q50 60 40 54 Z" fill="#334155" />
				<!-- Smile under mustache -->
				<path
					d="M46 58 Q50 62 54 58"
					stroke="#0F172A"
					stroke-width="1.8"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Cheeks blush -->
				<circle cx="36" cy="49" r="4" fill="#FB7185" opacity="0.4" />
				<circle cx="64" cy="49" r="4" fill="#FB7185" opacity="0.4" />
				<!-- Tall White Chef Toque Hat -->
				<path
					d="M34 32 C34 18, 42 10, 50 10 C58 10, 66 18, 66 32 Z"
					fill="#FFFFFF"
					stroke="#CBD5E1"
					stroke-width="1.5"
				/>
				<circle cx="40" cy="18" r="9" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
				<circle cx="50" cy="14" r="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
				<circle cx="60" cy="18" r="9" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
				<rect
					x="33"
					y="28"
					width="34"
					height="8"
					rx="2"
					fill="#F1F5F9"
					stroke="#94A3B8"
					stroke-width="1"
				/>
			{:else if avatarType === 'shopkeeper'}
				<!-- Shopkeeper / Clerk (Auntie Lin: high bun, round glasses, pearl brooch, apron) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="url(#roseKnit)" />
				<path d="M38 74 L50 86 L62 74 Z" fill="#FEF3C7" />
				<!-- Neck -->
				<rect x="44" y="54" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<!-- Head -->
				<ellipse cx="50" cy="43" rx="18" ry="20" fill="url(#skinBase)" />
				<!-- Bun with hairpin -->
				<circle cx="50" cy="17" r="11" fill="url(#darkHair)" />
				<line
					x1="38"
					y1="16"
					x2="62"
					y2="18"
					stroke="#D97706"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<!-- Hair sides -->
				<path
					d="M30 42 C30 26, 40 22, 50 22 C60 22, 70 26, 70 42 C66 32, 58 28, 50 28 C42 28, 34 32, 30 42 Z"
					fill="url(#darkHair)"
				/>
				<!-- Round Chic Glasses -->
				<circle cx="41" cy="41" r="6" fill="none" stroke="#B45309" stroke-width="2" />
				<circle cx="59" cy="41" r="6" fill="none" stroke="#B45309" stroke-width="2" />
				<line x1="47" y1="41" x2="53" y2="41" stroke="#B45309" stroke-width="2" />
				<circle cx="41" cy="41" r="2" fill="#0F172A" />
				<circle cx="59" cy="41" r="2" fill="#0F172A" />
				<!-- Smile -->
				<path
					d="M45 50 Q50 55 55 50"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Cheeks blush -->
				<circle cx="36" cy="47" r="3.5" fill="#FB7185" opacity="0.4" />
				<circle cx="64" cy="47" r="3.5" fill="#FB7185" opacity="0.4" />
			{:else if avatarType === 'teacher'}
				<!-- Teacher Yu (Neat bob, smart tortoiseshell glasses, navy blazer) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="url(#indigoSuit)" />
				<path d="M42 68 L50 82 L58 68 Z" fill="#FFFFFF" />
				<rect x="44" y="54" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="42" rx="18" ry="20" fill="url(#skinBase)" />
				<!-- Neat fringe & bob -->
				<path
					d="M30 44 C28 26, 40 18, 50 18 C60 18, 72 26, 70 44 C72 52, 68 56, 68 56 C68 56, 66 30, 50 30 C34 30, 32 56, 32 56 Z"
					fill="url(#darkHair)"
				/>
				<!-- Modern Rectangle Glasses -->
				<rect
					x="34"
					y="37"
					width="13"
					height="9"
					rx="2.5"
					fill="none"
					stroke="#4338CA"
					stroke-width="2"
				/>
				<rect
					x="53"
					y="37"
					width="13"
					height="9"
					rx="2.5"
					fill="none"
					stroke="#4338CA"
					stroke-width="2"
				/>
				<line x1="47" y1="41" x2="53" y2="41" stroke="#4338CA" stroke-width="2" />
				<circle cx="40.5" cy="41.5" r="2" fill="#0F172A" />
				<circle cx="59.5" cy="41.5" r="2" fill="#0F172A" />
				<path
					d="M46 50 Q50 54 54 50"
					stroke="#0F172A"
					stroke-width="2"
					stroke-linecap="round"
					fill="none"
				/>
			{:else if avatarType === 'driver'}
				<!-- Driver Master Zhang / Captain Chen (Peaked driver cap with visor, sturdy shirt) -->
				<path d="M22 100 C22 75, 35 70, 50 70 C65 70, 78 75, 78 100 Z" fill="#475569" />
				<path d="M42 70 L50 84 L58 70 Z" fill="#F8FAFC" />
				<!-- Neck -->
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<!-- Head -->
				<ellipse cx="50" cy="45" rx="19" ry="20" fill="url(#skinBase)" />
				<circle cx="31" cy="46" r="4" fill="url(#skinBase)" />
				<circle cx="69" cy="46" r="4" fill="url(#skinBase)" />
				<!-- Eyes & Eyebrows -->
				<path
					d="M37 39 Q42 36 45 39"
					stroke="#0F172A"
					stroke-width="2.5"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M55 39 Q58 36 63 39"
					stroke="#0F172A"
					stroke-width="2.5"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="41" cy="43" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="43" r="2.2" fill="#0F172A" />
				<!-- Confident Smile -->
				<path
					d="M44 52 Q50 57 56 52"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Peaked Driving Cap -->
				<path d="M30 33 C30 20, 42 16, 50 16 C58 16, 70 20, 70 33 Z" fill="#1E293B" />
				<rect x="28" y="30" width="44" height="6" rx="2" fill="#334155" />
				<!-- Visor / Peak -->
				<path d="M26 35 Q50 40 74 35 Q50 33 26 35 Z" fill="#0F172A" />
				<!-- Golden Cap Badge -->
				<circle cx="50" cy="25" r="3.5" fill="#F59E0B" />
			{:else if avatarType === 'auntie-mei'}
				<!-- Auntie Mei (Market Merchant: jade comb, smiling laugh lines, patterned silk top) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="url(#emeraldShirt)" />
				<path d="M48 68 L50 78 L52 68 Z" fill="#A7F3D0" />
				<!-- Neck -->
				<rect x="44" y="54" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="43" rx="19" ry="20" fill="url(#skinBase)" />
				<!-- Hair with silver streak & jade pin -->
				<circle cx="50" cy="18" r="10" fill="url(#darkHair)" />
				<line
					x1="42"
					y1="16"
					x2="58"
					y2="18"
					stroke="#10B981"
					stroke-width="3.5"
					stroke-linecap="round"
				/>
				<path
					d="M30 42 C30 26, 42 24, 50 24 C58 24, 70 26, 70 42 C65 32, 57 28, 50 28 C43 28, 35 32, 30 42 Z"
					fill="url(#darkHair)"
				/>
				<!-- Smiling crinkly eyes -->
				<path
					d="M37 40 Q41 36 45 40"
					stroke="#0F172A"
					stroke-width="2.4"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M55 40 Q59 36 63 40"
					stroke="#0F172A"
					stroke-width="2.4"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Bright warm smile -->
				<path
					d="M43 49 Q50 56 57 49"
					stroke="#0F172A"
					stroke-width="2.4"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="36" cy="46" r="4" fill="#FB7185" opacity="0.4" />
				<circle cx="64" cy="46" r="4" fill="#FB7185" opacity="0.4" />
			{:else if avatarType === 'mom'}
				<!-- Mommy Zhang (Soft wavy hair, gentle gaze, peach knit sweater) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="#FB923C" />
				<path d="M40 68 Q50 78 60 68 Z" fill="#FFEDD5" />
				<rect x="44" y="54" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="42" rx="18" ry="20" fill="url(#skinBase)" />
				<!-- Soft Wavy Hair -->
				<path
					d="M28 42 C26 24, 40 18, 50 18 C60 18, 74 24, 72 42 C74 54, 70 58, 68 62 C64 48, 62 26, 50 26 C38 26, 36 48, 32 62 Z"
					fill="#78350F"
				/>
				<circle cx="41" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="42" cy="40" r="0.8" fill="#FFFFFF" />
				<circle cx="60" cy="40" r="0.8" fill="#FFFFFF" />
				<path
					d="M45 49 Q50 54 55 49"
					stroke="#78350F"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="37" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
				<circle cx="63" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
			{:else if avatarType === 'son'}
				<!-- Son / Young Boy (Playful messy hair, open grin, striped collar) -->
				<path d="M24 100 C24 78, 36 72, 50 72 C64 72, 76 78, 76 100 Z" fill="#3B82F6" />
				<line x1="26" y1="84" x2="74" y2="84" stroke="#FFFFFF" stroke-width="3" />
				<line x1="28" y1="94" x2="72" y2="94" stroke="#FFFFFF" stroke-width="3" />
				<rect x="44" y="58" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="44" rx="17" ry="19" fill="url(#skinBase)" />
				<!-- Big curious eyes -->
				<circle cx="42" cy="43" r="2.8" fill="#0F172A" />
				<circle cx="58" cy="43" r="2.8" fill="#0F172A" />
				<circle cx="43" cy="42" r="1" fill="#FFFFFF" />
				<circle cx="59" cy="42" r="1" fill="#FFFFFF" />
				<!-- Big grin -->
				<path d="M43 51 Q50 58 57 51 Z" fill="#E11D48" />
				<!-- Messy spiky hair -->
				<path
					d="M30 40 C28 26, 36 20, 50 20 C64 20, 72 26, 70 40 C66 32, 58 28, 50 28 C42 28, 34 32, 30 40 Z"
					fill="url(#darkHair)"
				/>
				<path
					d="M42 22 L46 14 L50 22 L54 13 L58 22"
					stroke="#0F172A"
					stroke-width="3"
					stroke-linecap="round"
					fill="none"
				/>
			{:else if avatarType === 'tea-master'}
				<!-- Tea Master Ling (Serene, traditional frog-collar celadon tunic, bamboo hair stick) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="#A7F3D0" />
				<path d="M47 68 L50 80 L53 68 Z" fill="#065F46" />
				<rect x="44" y="54" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="42" rx="18" ry="20" fill="url(#skinBase)" />
				<!-- Sleek pinned hair -->
				<circle cx="50" cy="18" r="9" fill="url(#darkHair)" />
				<line
					x1="40"
					y1="18"
					x2="60"
					y2="18"
					stroke="#D97706"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<path
					d="M30 40 C30 24, 42 24, 50 24 C58 24, 70 24, 70 40 C64 32, 57 28, 50 28 C43 28, 36 32, 30 40 Z"
					fill="url(#darkHair)"
				/>
				<!-- Serene closed eyes -->
				<path
					d="M38 41 Q42 44 46 41"
					stroke="#065F46"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M54 41 Q58 44 62 41"
					stroke="#065F46"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M46 50 Q50 54 54 50"
					stroke="#065F46"
					stroke-width="2"
					stroke-linecap="round"
					fill="none"
				/>
			{:else if avatarType === 'station-officer'}
				<!-- Station Officer (Transit peaked officer cap with gold crest, navy uniform & tie) -->
				<path d="M22 100 C22 75, 35 70, 50 70 C65 70, 78 75, 78 100 Z" fill="#1E3A8A" />
				<path d="M44 70 L50 82 L56 70 Z" fill="#FFFFFF" />
				<path d="M48 76 L50 92 L52 76 Z" fill="#B91C1C" />
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="44" rx="19" ry="20" fill="url(#skinBase)" />
				<circle cx="41" cy="43" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="43" r="2.2" fill="#0F172A" />
				<path
					d="M45 52 Q50 56 55 52"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Conductor Cap -->
				<path d="M30 33 C30 20, 42 15, 50 15 C58 15, 70 20, 70 33 Z" fill="#1E3A8A" />
				<rect x="28" y="28" width="44" height="6" rx="2" fill="#172554" />
				<path d="M26 34 Q50 39 74 34 Q50 32 26 34 Z" fill="#0F172A" />
				<!-- Gold Wings Crest -->
				<path d="M46 24 L50 21 L54 24 L50 26 Z" fill="#F59E0B" />
			{:else if avatarType === 'doctor'}
				<!-- Dr. Yin (Tone / Speech Doctor: white lab coat, silver stethoscope, rimless specs) -->
				<path
					d="M22 100 C22 75, 35 70, 50 70 C65 70, 78 75, 78 100 Z"
					fill="#FFFFFF"
					stroke="#E2E8F0"
					stroke-width="1.5"
				/>
				<path d="M44 70 L50 84 L56 70 Z" fill="#0D9488" />
				<!-- Stethoscope loop -->
				<path d="M36 76 C36 90, 64 90, 64 76" stroke="#64748B" stroke-width="2.5" fill="none" />
				<circle cx="50" cy="90" r="3" fill="#94A3B8" />
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="43" rx="18" ry="20" fill="url(#skinBase)" />
				<!-- Hair -->
				<path
					d="M30 40 C30 24, 42 20, 50 20 C58 20, 70 24, 70 40 C65 30, 58 26, 50 26 C42 26, 35 30, 30 40 Z"
					fill="url(#darkHair)"
				/>
				<!-- Glasses -->
				<rect
					x="35"
					y="38"
					width="12"
					height="8"
					rx="2"
					fill="none"
					stroke="#64748B"
					stroke-width="1.8"
				/>
				<rect
					x="53"
					y="38"
					width="12"
					height="8"
					rx="2"
					fill="none"
					stroke="#64748B"
					stroke-width="1.8"
				/>
				<line x1="47" y1="42" x2="53" y2="42" stroke="#64748B" stroke-width="1.8" />
				<circle cx="41" cy="42" r="2" fill="#0F172A" />
				<circle cx="59" cy="42" r="2" fill="#0F172A" />
				<path
					d="M46 51 Q50 55 54 51"
					stroke="#0F172A"
					stroke-width="2"
					stroke-linecap="round"
					fill="none"
				/>
			{:else if avatarType === 'master-liu'}
				<!-- Master Liu (Silver hair/beard, linen robe, sage eyes) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="#334155" />
				<rect x="44" y="54" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="44" rx="19" ry="20" fill="url(#skinBase)" />
				<!-- Silver Hair -->
				<path
					d="M30 42 C30 22, 42 18, 50 18 C58 18, 70 22, 70 42 C65 30, 57 26, 50 26 C43 26, 35 30, 30 42 Z"
					fill="#94A3B8"
				/>
				<!-- Silver Beard -->
				<path d="M44 55 Q50 66 56 55 Q50 58 44 55 Z" fill="#CBD5E1" />
				<path
					d="M37 40 Q41 37 45 40"
					stroke="#1E293B"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<path
					d="M55 40 Q59 37 63 40"
					stroke="#1E293B"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="41" cy="43" r="2" fill="#0F172A" />
				<circle cx="59" cy="43" r="2" fill="#0F172A" />
			{:else if avatarType === 'xiao-bo'}
				<!-- Techie Bo (Vibrant hoodie, headphones around neck, modern hairstyle) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="#8B5CF6" />
				<path d="M38 72 Q50 84 62 72 Z" fill="#7C3AED" />
				<!-- Headphones around neck -->
				<path
					d="M34 62 C34 78, 66 78, 66 62"
					stroke="#0F172A"
					stroke-width="4"
					stroke-linecap="round"
					fill="none"
				/>
				<rect x="30" y="58" width="8" height="12" rx="3" fill="#EC4899" />
				<rect x="62" y="58" width="8" height="12" rx="3" fill="#EC4899" />
				<rect x="44" y="54" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="42" rx="18" ry="20" fill="url(#skinBase)" />
				<!-- Textured modern hair -->
				<path
					d="M30 40 C30 22, 42 16, 50 16 C60 16, 70 22, 70 40 C65 30, 58 26, 50 26 C42 26, 35 30, 30 40 Z"
					fill="url(#darkHair)"
				/>
				<circle cx="41" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="41" r="2.2" fill="#0F172A" />
				<path
					d="M45 49 Q50 55 55 49"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
			{:else if avatarType === 'traveler'}
				<!-- Modern Urban Traveler (Warm amber jacket, beanie/cap, keen eyes) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="url(#amberShirt)" />
				<path d="M42 68 L50 82 L58 68 Z" fill="#FEF3C7" />
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="43" rx="19" ry="20" fill="url(#skinBase)" />
				<!-- Warm Beanie / Cap -->
				<path d="M29 36 C29 20, 42 16, 50 16 C58 16, 71 20, 71 36 Z" fill="#047857" />
				<rect x="27" y="32" width="46" height="7" rx="3" fill="#065F46" />
				<circle cx="41" cy="42" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="42" r="2.2" fill="#0F172A" />
				<circle cx="42" cy="41" r="0.8" fill="#FFFFFF" />
				<circle cx="60" cy="41" r="0.8" fill="#FFFFFF" />
				<path
					d="M45 50 Q50 55 55 50"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
			{:else if avatarType === 'friend'}
				<!-- Cheerful Companion / Friend (Ponytail / hair scrunchie, bright coral shirt) -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="#F43F5E" />
				<path d="M42 68 L50 80 L58 68 Z" fill="#FFF1F2" />
				<!-- High Ponytail -->
				<circle cx="66" cy="22" r="8" fill="url(#darkHair)" />
				<circle cx="62" cy="26" r="3" fill="#F59E0B" />
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="42" rx="18" ry="20" fill="url(#skinBase)" />
				<!-- Hair with bangs -->
				<path
					d="M30 40 C30 24, 42 20, 50 20 C60 20, 70 24, 70 40 C65 30, 58 26, 50 26 C42 26, 35 30, 30 40 Z"
					fill="url(#darkHair)"
				/>
				<circle cx="41" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="41" r="2.2" fill="#0F172A" />
				<path
					d="M44 49 Q50 55 56 49"
					stroke="#0F172A"
					stroke-width="2.2"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="37" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
				<circle cx="63" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
			{:else}
				<!-- Default Illustrated Storybook Character -->
				<path d="M22 100 C22 75, 35 68, 50 68 C65 68, 78 75, 78 100 Z" fill="url(#indigoSuit)" />
				<path d="M44 68 L50 80 L56 68 Z" fill="#EEF2FF" />
				<rect x="44" y="55" width="12" height="15" rx="4" fill="url(#skinBase)" />
				<ellipse cx="50" cy="42" rx="18" ry="20" fill="url(#skinBase)" />
				<path
					d="M30 38 C30 24, 42 20, 50 20 C58 20, 70 24, 70 38 C65 28, 58 24, 50 24 C42 24, 35 28, 30 38 Z"
					fill="url(#darkHair)"
				/>
				<circle cx="41" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="59" cy="41" r="2.2" fill="#0F172A" />
				<circle cx="42" cy="40" r="0.8" fill="#FFFFFF" />
				<circle cx="60" cy="40" r="0.8" fill="#FFFFFF" />
				<path
					d="M45 49 Q50 54 55 49"
					stroke="#0F172A"
					stroke-width="2"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="38" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
				<circle cx="62" cy="46" r="3.5" fill="#FB7185" opacity="0.4" />
			{/if}

			<!-- Delicate vignette ring border -->
			<circle
				cx="50"
				cy="50"
				r="48"
				fill="none"
				stroke="#E2E8F0"
				stroke-width="1.5"
				opacity="0.7"
			/>
		</svg>
	{/if}
</div>
