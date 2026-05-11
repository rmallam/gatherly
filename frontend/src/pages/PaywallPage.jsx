import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Star, Shield, Zap, Users } from 'lucide-react';
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


    useEffect(() => {
        const loadOfferings = async () => {
            // In non-native dev, we might not get offerings. 
            // We can mock data for the UI if null.
            const current = await PurchaseService.getOfferings();
            setOfferings(current);


            setLoading(false);
        };
        loadOfferings();
    }, []);

    const { refreshUser, user } = useAuth();

    const handlePurchase = async () => {
        if (!selectedPackage) {
            alert('Please select a plan first.');
            return;
        }

        setProcessing(true);
        try {
            // Check if it's a real RevenueCat package or a mock one
            if (offerings && selectedPackage.product?.identifier) {
                // Real Purchase
                await PurchaseService.purchasePackage(selectedPackage);

                // Wait a moment for webhook to process (if fast) or just refresh to be checking
                // Ideally, we should poll or just update local entitlement check
                // For now, try to refresh user from backend
                await new Promise(r => setTimeout(r, 2000)); // Give webhook a slight chance
                await refreshUser();
            } else {
                // Simulation for dev/mock
                await new Promise(r => setTimeout(r, 1000));
                console.log('Simulating purchase for:', selectedPackage.identifier);
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

    // Helper to normalize subscription period display
    // Google Play test subscriptions use accelerated periods (5 mins = 1 month)
    const normalizeSubscriptionPeriod = (title, priceString) => {
        // If it's a test subscription with "5 mins" or similar, map to production period
        const testPeriodMap = {
            '5 mins': 'month',
            '5 minutes': 'month',
            '10 mins': '2 months',
            '15 mins': '3 months',
            '1 hour': 'year'
        };

        let normalizedTitle = title;
        let normalizedPrice = priceString;

        // Check if title contains test period
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

    // Fallback/Mock Data if no native offerings found (for web dev)
    const rawPackages = offerings?.availablePackages || [
        {
            identifier: 'pro_monthly',
            product: {
                title: 'Pro Monthly',
                priceString: '$4.99',
                description: 'Unlock all features'
            }
        },
        {
            identifier: 'pro_yearly',
            product: {
                title: 'Pro Yearly',
                priceString: '$49.99',
                description: 'Save 20%'
            }
        }
    ];

    // Filter out SMS packs from the main subscription list
    const displayPackages = rawPackages.filter(p => !p.identifier.toLowerCase().includes('sms'));

    return (
        <div className="paywall-container">
            <button className="paywall-close" onClick={() => navigate(-1)}>
                <X size={24} />
            </button>

            <div className="paywall-header">
                <div className="pro-badge">PRO</div>
                <h1>Upgrade to HostEze Pro</h1>
                <p>Remove limits and unleash the full power of your events.</p>
            </div>

            <div className="paywall-benefits">
                <div className="benefit-row">
                    <div className="benefit-icon-box"><Star size={20} /></div>
                    <div className="benefit-text">
                        <h3>Unlimited Events</h3>
                        <p>Create as many events as you need.</p>
                    </div>
                </div>
                <div className="benefit-row">
                    <div className="benefit-icon-box"><Users size={20} /></div>
                    <div className="benefit-text">
                        <h3>Unlimited Guests</h3>
                        <p>No more 50-guest limit per event.</p>
                    </div>
                </div>
                <div className="benefit-row">
                    <div className="benefit-icon-box"><Shield size={20} /></div>
                    <div className="benefit-text">
                        <h3>Ad-Free Experience</h3>
                        <p>Focus on what matters without distractions.</p>
                    </div>
                </div>
                <div className="benefit-row">
                    <div className="benefit-icon-box"><Zap size={20} /></div>
                    <div className="benefit-text">
                        <h3>Priority Support</h3>
                        <p>Get help when you need it most.</p>
                    </div>
                </div>
            </div>

            <div className="paywall-packages">
                {loading ? (
                    <div className="loading-spinner">Loading packages...</div>
                ) : (
                    displayPackages.map((pkg, index) => {
                        const normalized = normalizeSubscriptionPeriod(
                            pkg.product.title,
                            pkg.product.priceString
                        );
                        return (
                            <div
                                key={index}
                                className={`package-card ${selectedPackage?.identifier === pkg.identifier ? 'selected' : ''}`}
                                onClick={() => setSelectedPackage(pkg)}
                            >
                                <div className="package-info">
                                    <span className="package-title">{normalized.title}</span>
                                    {pkg.identifier.includes('yearly') && <span className="save-badge">SAVE 20%</span>}
                                </div>
                                <div className="package-price">{normalized.priceString}</div>
                            </div>
                        );
                    })
                )}
            </div>

            <button
                className="paywall-cta"
                onClick={user?.subscription_tier === 'pro' ? () => PurchaseService.manageSubscriptions() : handlePurchase}
                disabled={user?.subscription_tier !== 'pro' && (processing || !selectedPackage)}
                style={{
                    opacity: (user?.subscription_tier !== 'pro' && !selectedPackage) ? 0.5 : 1,
                    background: user?.subscription_tier === 'pro' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    fontWeight: 700,
                    marginBottom: user?.subscription_tier === 'pro' ? '12px' : '0'
                }}
            >
                {processing ? 'Processing...' : (
                    user?.subscription_tier === 'pro' ? 'Manage Subscription' : 'Start Pro Access'
                )}
            </button>



            {/* Explicit Cancel Option for Pro Users */}
            {
                user?.subscription_tier === 'pro' && (
                    <button
                        onClick={() => PurchaseService.manageSubscriptions()}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            width: '100%',
                            padding: '14px',
                            borderRadius: '16px',
                            fontWeight: 600,
                            fontSize: '15px',
                            cursor: 'pointer',
                            marginTop: '0'
                        }}
                    >
                        Cancel Subscription
                    </button>
                )
            }

            {
                !user?.subscription_tier === 'pro' && (
                    <button
                        className="comparison-link-btn"
                        onClick={() => setShowComparisonModal(true)}
                    >
                        View detailed plan comparison
                    </button>
                )
            }

            <div className="paywall-footer">
                <button onClick={handleRestore}>Restore Purchases</button>
                <span>•</span>
                <button>Terms of Service</button>
                <span>•</span>
                <button>Privacy Policy</button>
            </div>

            <SubscriptionComparisonModal
                isOpen={showComparisonModal}
                onClose={() => setShowComparisonModal(false)}
            />
        </div >
    );
};

export default PaywallPage;
