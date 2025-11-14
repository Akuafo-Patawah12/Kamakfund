import React, { useEffect, useState } from 'react';
import { User, Mail, MapPin, Phone, Building2, Briefcase,  FileText, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerProfile {
    customerId?: number;
    accountOfficerCode?: string | null;
    agencyAddress?: string | null;
    agencyName?: string | null;
    agencyTelephones?: string | null;
    annualIncome?: number | null;
    city?: string;
    country?: string;
    customerInstruction?: string | null;
    customerName?: string;
    customerType?: string | null;
    dateOfBirth?: string;
    email?: string;
    industry?: string | null;
    kyccompliant?: string | null;
    occupation?: string | null;
    state?: string;
    streetAddress1?: string;
    streetAddress2?: string;
    telephone1?: string;
    telephone2?: string;
    website?: string | null;
    zipcode?: string;
}

interface InfoItemProps {
    label: string;
    value?: string | number | null;
    fullWidth?: boolean;
}

const Profile: React.FC = () => {
    const [profileData, setProfileData] = useState<CustomerProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
    const [addressData, setAddressData] = useState<{
        streetAddress1: string;
        streetAddress2: string;
        city: string;
        state: string;
        country: string;
        zipcode: string;
    }>({
        streetAddress1: '',
        streetAddress2: '',
        city: '',
        state: '',
        country: '',
        zipcode: ''
    });

    const navigate = useNavigate();

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:8090/kamakfund/rest/kamak/customer/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            const result = await response.json();
            console.log('Fetched profile data:', result);

            if (result.status !== 1) {
                navigate('/session-expired?reason=unauthorized');
                return;
            }
            setProfileData(result.data);
            setAddressData({
                streetAddress1: result.data?.streetAddress1 || '',
                streetAddress2: result.data?.streetAddress2 || '',
                city: result.data?.city || '',
                state: result.data?.state || '',
                country: result.data?.country || '',
                zipcode: result.data?.zipcode || ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleEditAddress = () => {
        setIsEditingAddress(true);
    };

    const handleCancelEdit = () => {
        // Reset to original data
        setAddressData({
            streetAddress1: profileData?.streetAddress1 || '',
            streetAddress2: profileData?.streetAddress2 || '',
            city: profileData?.city || '',
            state: profileData?.state || '',
            country: profileData?.country || '',
            zipcode: profileData?.zipcode || ''
        });
        setIsEditingAddress(false);
    };

    const handleSaveAddress = async () => {
        try {
            const response = await fetch('http://localhost:8090/kamakfund/rest/kamak/customer/profile/edit', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(addressData)
            });

            if (!response.ok) {
                throw new Error('Failed to update address');
            }

            // Update profile data with new address
            setProfileData(prev => prev ? { ...prev, ...addressData } : null);
            setIsEditingAddress(false);
        } catch (err) {
            console.error('Error updating address:', err);
            alert('Failed to update address. Please try again.');
        }
    };

    const handleAddressChange = (field: keyof typeof addressData, value: string) => {
        setAddressData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-md w-full">
                    <div className="flex items-center gap-3 text-red-600 mb-3">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <h2 className="text-lg font-semibold">Error Loading Profile</h2>
                    </div>
                    <p className="text-gray-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const InfoItem: React.FC<InfoItemProps> = ({ label, value, fullWidth = false }) => {
        if (!value) return null;
        
        return (
            <div className={fullWidth ? 'col-span-2' : ''}>
                <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
                <dd className="text-sm text-gray-900">{value}</dd>
            </div>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-linear-to-r from-gray-100 to-gray-200 px-6 py-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md border border-gray-200">
                                <User className="w-10 h-10 text-gray-600" />
                            </div>
                            <div className="text-gray-700 min-w-0 flex-1">
                                <h1 className="text-xl font-semibold mb-2 truncate">
                                    {profileData?.customerName || 'Customer Profile'}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-gray-600">
                                    {profileData?.email && (
                                        <div className="flex bg-stone-200 py-1 px-2  rounded-xl items-center gap-2">
                                            <Mail className="w-4 h-4 shrink-0" />
                                            <span className="text-sm">{profileData.email}</span>
                                        </div>
                                    )}
                                    {profileData?.telephone1 && (
                                        <div className="flex bg-stone-200 py-1 px-2 rounded-xl items-center gap-2">
                                            <Phone className="w-4 h-4 shrink-0" />
                                            <span className="text-sm">{profileData.telephone1}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                        </div>
                        <dl className="grid grid-cols-1 gap-4">
                            <InfoItem label="Full Name" value={profileData?.customerName} />
                            <InfoItem label="Date of Birth" value={formatDate(profileData?.dateOfBirth)} />
                            <InfoItem label="Customer Type" value={profileData?.customerType} />
                        </dl>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <InfoItem label="Email" value={profileData?.email} fullWidth />
                            <InfoItem label="Primary Phone" value={profileData?.telephone1} />
                            <InfoItem label="Secondary Phone" value={profileData?.telephone2} />
                            <InfoItem label="Website" value={profileData?.website} fullWidth />
                        </dl>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Address</h2>
                            </div>
                            {!isEditingAddress ? (
                                <button
                                    onClick={handleEditAddress}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveAddress}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {isEditingAddress ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={addressData.streetAddress1}
                                        onChange={(e) => handleAddressChange('streetAddress1', e.target.value)}
                                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                                    <input
                                        type="text"
                                        value={addressData.streetAddress2}
                                        onChange={(e) => handleAddressChange('streetAddress2', e.target.value)}
                                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Address Line 2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={addressData.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={addressData.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={addressData.country}
                                        onChange={(e) => handleAddressChange('country', e.target.value)}
                                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Country"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                    <input
                                        type="text"
                                        value={addressData.zipcode}
                                        onChange={(e) => handleAddressChange('zipcode', e.target.value)}
                                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Zip Code"
                                    />
                                </div>
                            </div>
                        ) : (
                            <dl className="grid grid-cols-2 gap-4">
                                <InfoItem label="Street Address" value={profileData?.streetAddress1} fullWidth />
                                <InfoItem label="Address Line 2" value={profileData?.streetAddress2} fullWidth />
                                <InfoItem label="City" value={profileData?.city} />
                                <InfoItem label="State" value={profileData?.state} />
                                <InfoItem label="Country" value={profileData?.country} />
                                <InfoItem label="Zip Code" value={profileData?.zipcode} />
                            </dl>
                        )}
                    </div>

                    {/* Professional Information */}
                    {(profileData?.occupation || profileData?.industry || profileData?.annualIncome) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Professional Details</h2>
                            </div>
                            <dl className="grid grid-cols-2 gap-4">
                                <InfoItem label="Occupation" value={profileData?.occupation} fullWidth />
                                <InfoItem label="Industry" value={profileData?.industry} fullWidth />
                                <InfoItem 
                                    label="Annual Income" 
                                    value={profileData?.annualIncome ? `$${profileData.annualIncome.toLocaleString()}` : null}
                                    fullWidth
                                />
                            </dl>
                        </div>
                    )}

                    {/* Agency Information */}
                    {(profileData?.agencyName || profileData?.agencyAddress) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Agency Information</h2>
                            </div>
                            <dl className="grid grid-cols-1 gap-4">
                                <InfoItem label="Agency Name" value={profileData?.agencyName} />
                                <InfoItem label="Agency Address" value={profileData?.agencyAddress} />
                                <InfoItem label="Agency Phone" value={profileData?.agencyTelephones} />
                            </dl>
                        </div>
                    )}

                    {/* Compliance */}
                    {(profileData?.kyccompliant || profileData?.accountOfficerCode) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Compliance & Status</h2>
                            </div>
                            <dl className="grid grid-cols-2 gap-4">
                                <InfoItem 
                                    label="KYC Compliant" 
                                    value={profileData?.kyccompliant === '1' ? 'Yes' : profileData?.kyccompliant === '0' ? 'No' : null}
                                />
                                <InfoItem label="Account Officer" value={profileData?.accountOfficerCode} />
                            </dl>
                        </div>
                    )}
                </div>

                {/* Customer Instructions */}
                {profileData?.customerInstruction && (
                    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-yellow-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Customer Instructions</h2>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{profileData.customerInstruction}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;