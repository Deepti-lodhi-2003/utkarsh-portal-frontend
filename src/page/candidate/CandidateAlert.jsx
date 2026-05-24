
import React, { useState, useEffect } from 'react';
import { Check, X, MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const CandidateAlert = () => {
    const { t } = useTranslation();
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [preferredLocation, setPreferredLocation] = useState('');
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [existingAlerts, setExistingAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);

    const availableSkills = [
        'Plumber', 'Electrician', 'Sanitary Worker', 'Accountant',
        'Wireman', 'IT', 'Student', 'Finance', 'Call Center', 'BPO'
    ];

    const locationSuggestions = [
        'Bhopal', 'Banglore', 'Mumbai', 'Hyderabad', 'Delhi', 'Pune',
        'Chennai', 'Kolkata', 'Indore', 'Jaipur', 'Lucknow', 'Ahmedabad', 'Ujjain'
    ];

    // ─── FETCH EXISTING PROFILE (for alerts/preferences) ───
    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/candidates/profile');
            const profile = res.data.data;

            // Use preferredLocations and skills as "alerts"
            if (profile.preferredLocations?.length || profile.skills?.length) {
                setExistingAlerts([{
                    locations: profile.preferredLocations || [],
                    skills: profile.skills?.map(s => typeof s === 'string' ? s : s.name) || []
                }]);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoadingAlerts(false);
        }
    };

    const toggleSkill = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setPreferredLocation(value);

        if (value.trim()) {
            setError('');
            const filtered = locationSuggestions.filter(location =>
                location.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredLocations(filtered);
            setShowLocationDropdown(true);
        } else {
            setShowLocationDropdown(false);
            setFilteredLocations([]);
        }
    };

    const selectLocation = (location) => {
        setPreferredLocation(location);
        setShowLocationDropdown(false);
        setFilteredLocations([]);
    };

    // ─── SAVE ALERT (API - Update candidate profile) ───
    const handleAddAlert = async (e) => {
        e.preventDefault();
        if (!preferredLocation.trim()) {
            setError(t('pages.candidate_alert.location_required'));
            setShowSuccessAlert(false);
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            // Update candidate profile with alert preferences
            const payload = {
                preferredLocations: [preferredLocation],
                isOpenToWork: true
            };

            await api.put('/candidates/profile', payload);

            // Update skills if selected
            if (selectedSkills.length > 0) {
                await api.put('/candidates/skills', {
                    skills: selectedSkills.map(skill => ({
                        name: skill,
                        level: 'intermediate'
                    }))
                });
            }

            setShowSuccessAlert(true);
            setError('');
            setPreferredLocation('');
            setSelectedSkills([]);

            // Refresh alerts
            await fetchAlerts();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Save alert failed:', error);
            setError(error.response?.data?.message || t('pages.candidate_alert.save_failed'));
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingAlerts) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#233480]" size={40} />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto px-2">
            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-[14px]">
                        <Check size={16} className="text-[#155724] stroke-[3px]" />
                        {t('pages.candidate_alert.save_success')}
                    </div>
                    <button onClick={() => setShowSuccessAlert(false)} className="text-[#155724] hover:opacity-70 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Existing Alerts or No Alert Banner */}
            {existingAlerts.length > 0 ? (
                <div className="bg-blue-50 border border-blue-100 py-3 mb-8 px-4 rounded">
                    <p className="text-[#233480] text-[14px] font-medium">
                        📍 {t('pages.candidate_alert.locations')}: {existingAlerts[0].locations.join(', ') || t('pages.candidate_alert.none')}
                    </p>
                    <p className="text-[#233480] text-[14px] font-medium mt-1">
                        🛠️ {t('pages.candidate_alert.skills')}: {existingAlerts[0].skills.join(', ') || t('pages.candidate_alert.none')}
                    </p>
                </div>
            ) : (
                <div className="bg-[#f8f9fa] border border-gray-100 py-3 mb-8 text-center rounded">
                    <p className="text-gray-500 text-[14px]">{t('pages.candidate_alert.no_alert')}</p>
                </div>
            )}

            <form onSubmit={handleAddAlert} className="space-y-6">
                {/* Skills Input Display */}
                <div className="relative">
                    <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded min-h-[45px] text-gray-400 text-sm flex items-center">
                        {selectedSkills.length > 0
                            ? selectedSkills.join(', ')
                            : t('pages.candidate_alert.skills_placeholder')}
                    </div>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {availableSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                            <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[13px] font-medium transition-all border ${isSelected
                                    ? 'bg-[#d4edda] border-[#c3e6cb] text-[#155724]'
                                    : 'bg-[#fff5e6] border-[#ffe8cc] text-[#ff9800] hover:bg-[#ffe8cc]'}`}>
                                {isSelected && <Check size={14} className="stroke-[3px]" />}
                                {skill}
                            </button>
                        );
                    })}
                </div>

                {/* Location Input with Autocomplete */}
                <div className="relative">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder={t('pages.candidate_alert.location_placeholder')} value={preferredLocation}
                            onChange={handleLocationChange}
                            onFocus={() => {
                                if (preferredLocation.trim()) {
                                    const filtered = locationSuggestions.filter(loc =>
                                        loc.toLowerCase().includes(preferredLocation.toLowerCase())
                                    );
                                    setFilteredLocations(filtered);
                                    setShowLocationDropdown(true);
                                }
                            }}
                            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                            className={`w-full pl-10 pr-4 py-3 bg-white border ${error ? 'border-red-300' : 'border-gray-200'} rounded text-gray-700 text-sm focus:outline-none focus:border-[#233480] transition-colors`} />
                    </div>

                    {showLocationDropdown && filteredLocations.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {filteredLocations.map((location, index) => (
                                <div key={index} onClick={() => selectLocation(location)}
                                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex items-center gap-2 transition-colors">
                                    <MapPin size={14} className="text-gray-400" />
                                    {location}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="text-center">
                        <p className="text-red-500 text-sm animate-in fade-in duration-300 font-medium">{error}</p>
                    </div>
                )}

                <div className="flex justify-center pt-4">
                    <button type="submit" disabled={isSaving}
                        className={`w-full md:w-auto px-16 md:px-12 py-3 bg-[#233480] text-white font-bold rounded hover:bg-[#1a2660] transition-all text-sm shadow-md uppercase tracking-wide ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" /> {t('pages.candidate_alert.saving')}
                            </span>
                        ) : t('pages.candidate_alert.add')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CandidateAlert;