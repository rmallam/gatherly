import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Users, Infinity, Ticket, Globe, Scan, List, BarChart, Search, Settings } from 'lucide-react';
import PurchaseService from '../services/PurchaseService';
import SubscriptionComparisonModal from '../components/SubscriptionComparisonModal';
import './PaywallPage.css';

const PaywallPage = () => {
    const navigate = useNavigate();
    const [offerings, setOfferings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);

    useEffect(() => {
        const loadOfferings = async () => {
            const current = await PurchaseService.getOfferings();
            setOfferings(current);
            setLoading(false);
        };
        loadOfferings();
    }, []);

    const { refreshUser, user } = useAuth();

    const handlePurchase = async () => {
        if (!selectedPackage) {
            setShowBottomSheet(true);
            return;
        }

        setProcessing(true);
        try {
            if (offerings && selectedPackage.product?.identifier) {
                await PurchaseService.purchasePackage(selectedPackage);
                await new Promise(r => setTimeout(r, 2000));
                await refreshUser();
            } else {
                await new Promise(r => setTimeout(r, 1000));
                alert('Simulation: Purchase Successful! (This is a mock implementation)');
            }
            navigate('/', { replace: true });
        } catch (error) {
            if (error.message !== 'User cancelled') {
                alert('Purchase failed: ' + error.message);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleRestore = async () => {
        setProcessing(true);
        try {
            await PurchaseService.restorePurchases();
            alert('Purchases restored successfully!');
            navigate('/manager');
        } catch (error) {
            alert('Failed to restore: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const normalizeSubscriptionPeriod = (title, priceString) => {
        const testPeriodMap = {
            '5 mins': 'month',
            '5 minutes': 'month',
            '10 mins': '2 months',
            '15 mins': '3 months',
            '1 hour': 'year'
        };

        let normalizedTitle = title;
        let normalizedPrice = priceString;

        for (const [testPeriod, prodPeriod] of Object.entries(testPeriodMap)) {
            if (title.toLowerCase().includes(testPeriod)) {
                normalizedTitle = title.replace(new RegExp(testPeriod, 'gi'), prodPeriod);
            }
            if (priceString.toLowerCase().includes(testPeriod)) {
                normalizedPrice = priceString.replace(new RegExp(testPeriod, 'gi'), prodPeriod);
            }
        }

        return { title: normalizedTitle, priceString: normalizedPrice };
    };

    const rawPackages = (offerings?.availablePackages && offerings.availablePackages.length > 0) 
        ? offerings.availablePackages 
        : [
        {
            identifier: 'pro_monthly',
            product: {
                title: 'Individual',
                priceString: '$4.99',
                description: 'Unlock all features'
            }
        },
        {
            identifier: 'pro_yearly',
            product: {
                title: 'Individual + Trip Pass',
                priceString: '$49.99',
                description: 'yearly plan only'
            }
        }
    ];

    const displayPackages = rawPackages.filter(p => p.identifier && !p.identifier.toLowerCase().includes('sms'));

    // Automatically select the yearly option if available, otherwise first option
    useEffect(() => {
        if (!selectedPackage && displayPackages.length > 0) {
            const yearlyPackage = displayPackages.find(p => p.identifier.includes('yearly'));
            setSelectedPackage(yearlyPackage || displayPackages[0]);
        }
    }, [displayPackages, selectedPackage]);

    return (
        <div className="paywall-container">
            <div className="paywall-content">
                <button className="paywall-close" onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>

                <div className="paywall-header">
                    <h1>
                        Upgrade to<br />
                        <strong>HostEze Pro 💎</strong>
                    </h1>
                </div>

                <div className="paywall-benefits">
                    <div className="benefit-row">
                        <div className="benefit-icon-box"><Users size={20} /></div>
                        <div className="benefit-text">
                            <h3>Unlimited Events</h3>
                        </div>
                    </div>
                    <div className="benefit-row">
                        <div className="benefit-icon-box"><Infinity size={20} /></div>
                        <div className="benefit-text">
                            <h3>Unlimited Guests</h3>
                        </div>
                    </div>
                    <div className="benefit-row">
                        <div className="benefit-icon-box"><Ticket size={20} /></div>
                        <div className="benefit-text">
                            <h3>30-day Event Pass</h3>
                            <p>yearly plan only ⓘ</p>
                        </div>
                    </div>
                    <div className="benefit-row">
                        <div className="benefit-icon-box"><Globe size={20} /></div>
                        <div className="benefit-text">
                            <h3>Ad-Free Experience</h3>
                        </div>
                    </div>
                    <div className="benefit-row">
                        <div className="benefit-icon-box"><Scan size={20} /></div>
                        <div className="benefit-text">
                            <h3>Receipt scanning</h3>
                        </div>
                    </div>
                    <div className="benefit-row">
                        <div className="benefit-icon-box"><List size={20} /></div>
                        <div className="benefit-text">
                            <h3>Itemization</h3>
                        </div>
                    </div>
                    <div className="benefit-row">
                        <div className="benefit-icon-box"><BarChart size={20} /></div>
                        <div className="benefit-text">
                            <h3>Charts and graphs</h3>
                        </div>
                    </div>
                </div>

                <div className="paywall-bottom-area">
                    {user?.subscription_tier === 'pro' ? (
                        <>
                            <button className="paywall-cta" onClick={() => PurchaseService.manageSubscriptions()}>
                                Manage Subscription
                            </button>
                            <button
                                onClick={() => PurchaseService.manageSubscriptions()}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ef4444',
                                    color: '#ef4444',
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    marginBottom: '16px'
                                }}
                            >
                                Cancel Subscription
                            </button>
                        </>
                    ) : (
                        <button className="paywall-cta" onClick={() => setShowBottomSheet(true)}>
                            Start your free trial
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Sheet Overlay */}
            <div 
                className={`overlay ${showBottomSheet ? 'open' : ''}`} 
                onClick={() => setShowBottomSheet(false)}
            />

            {/* Pricing Bottom Sheet */}
            <div className={`pricing-bottom-sheet ${showBottomSheet ? 'open' : ''}`}>
                <div className="pricing-sheet-header">
                    <h2>Choose a plan for after your<br/><strong>7-day free trial</strong></h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                ) : (
                    displayPackages.map((pkg, index) => {
                        const normalized = normalizeSubscriptionPeriod(
                            pkg.product.title,
                            pkg.product.priceString
                        );
                        
                        // Extract per month logic (simplified for mockup)
                        const isYearly = pkg.identifier.includes('yearly');
                        const perMonthMock = isYearly ? 'A$3.33' : normalized.priceString;
                        const durationMock = isYearly ? '12 mo' : '1 mo';

                        return (
                            <div
                                key={index}
                                className={`package-card ${selectedPackage?.identifier === pkg.identifier ? 'selected' : ''}`}
                                onClick={() => setSelectedPackage(pkg)}
                            >
                                <div className="package-info">
                                    <div className="package-radio">
                                        {selectedPackage?.identifier === pkg.identifier && <Check size={12} color="white" />}
                                    </div>
                                    <div className="package-title-group">
                                        <span className="package-title">{normalized.title}</span>
                                        <span className="package-subtitle">{durationMock} • {normalized.priceString}</span>
                                    </div>
                                </div>
                                <div className="package-price-group">
                                    <span className="package-price">{perMonthMock}</span>
                                    <span className="package-price-period">per month</span>
                                </div>
                            </div>
                        );
                    })
                )}

                <button 
                    className="paywall-cta" 
                    onClick={handlePurchase}
                    disabled={processing}
                    style={{ marginTop: '8px' }}
                >
                    {processing ? 'Processing...' : 'Start your free trial'}
                </button>

                <button className="view-all-options" onClick={() => setShowComparisonModal(true)}>
                    View all options
                </button>

                <div className="pricing-sheet-footer">
                    Free trial only available to eligible first time subscribers.<br/>
                    Cancel 24 hours before trial ends to avoid being charged.<br/>
                    Trial ends upon cancelation. Recurring billing after free trial,<br/>
                    cancel anytime.<br/>
                    <br/>
                    <span onClick={handleRestore} style={{cursor: 'pointer', textDecoration: 'underline'}}>Restore Purchases</span> • <a href="#">Terms of Service</a> • <a href="#">Privacy Policy</a>
                </div>
            </div>

            <SubscriptionComparisonModal
                isOpen={showComparisonModal}
                onClose={() => setShowComparisonModal(false)}
            />
        </div>
    );
};

export default PaywallPage;
