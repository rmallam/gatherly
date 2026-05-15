import os
import re

tabs_dir = "frontend/src/components/tabs"

files = [
    "ScheduleTab.jsx",
    "EntertainmentTab.jsx",
    "BudgetTab.jsx",
    "GiftsTab.jsx",
    "TasksTab.jsx",
    "DecorationsTab.jsx",
    "CateringTab.jsx",
    "VendorsTab.jsx"
]

for filename in files:
    filepath = os.path.join(tabs_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    has_fab = "fab-button" in content or "btn-floating-action" in content
    has_pro_wrapper = "user?.subscription_tier === 'pro' &&" in content
    # Look for button that toggles AI state without pro wrapper
    has_toggle_button = re.search(r'onClick=\{\(\)\s*=>\s*setShowAI[a-zA-Z]+\(\!(showAI[a-zA-Z]+)\)\}', content) is not None
    # Look for modified upgrade card
    has_modified_upgrade_card = re.search(r'\{\s*showAI[a-zA-Z]+\s*&&\s*\(\s*!user\?\.subscription_tier\s*\|\|\s*user\?\.subscription_tier\s*===\s*\'free\'\s*\)\s*&&\s*\(', content) is not None

    print(f"{filename}: FAB={has_fab}, ProWrapper={has_pro_wrapper}, ToggleBtn={has_toggle_button}, ModifiedCard={has_modified_upgrade_card}")
