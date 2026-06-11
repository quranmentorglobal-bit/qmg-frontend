async function handleSubmit() {
  if (!validateStep(4)) return
  setSubmitting(true)

  const supabase = createClient()

  // Update profile
  await (supabase.from('profiles') as any).update({
    first_name: firstName,
    last_name: lastName,
    gender,
    country,
    phone,
    bio,
    avatar_url: photoUrl,
  }).eq('id', userId)

  // Update teacher profile
  const updateData: any = {
    status: 'pending',
    submitted_at: new Date().toISOString(),
    years_experience: Number(yearsExp),
    ijazah_verified: ijazah,
    specializations,
    teaching_languages: languages,
    available_days: availableDays,
    hourly_rate_usd: Number(hourlyRate),
    trial_rate_usd: Number(trialRate) || 0,
    profile_photo_url: photoUrl,
    rejection_reason: null,
  }

  if (tpId) {
    await (supabase.from('teacher_profiles') as any).update(updateData).eq('id', tpId)
  } else {
    await (supabase.from('teacher_profiles') as any).insert({ ...updateData, user_id: userId })
  }

  // Send email notification to admin
  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_application',
        teacherName: `${firstName} ${lastName}`,
        teacherEmail: (await supabase.auth.getUser()).data.user?.email || '',
        specializations,
      }),
    })
  } catch (e) {
    // Email failed silently — don't block the user
    console.error('Email notification failed:', e)
  }

  setStatus('pending')
  setSubmitting(false)
}
