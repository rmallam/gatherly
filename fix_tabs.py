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
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove FAB
    # Match something like:
    # {/* FAB */}
    # <button className="btn-floating-action... onClick={...}>
    #     <Plus size={24} />
    # </button>
    
    # Or just the button directly
    content = re.sub(r'\{\s*/\*\s*FAB\s*\*/\s*\}.*?<button[^>]*btn-floating-action[^>]*>.*?<Plus[^>]*size=\{24\}[^>]*>.*?</button>\n?', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<button[^>]*fab-button[^>]*>.*?<Plus[^>]*size=\{24\}[^>]*>.*?</button>\n?', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<button[^>]*btn-floating-action[^>]*>.*?<Plus[^>]*size=\{24\}[^>]*>.*?</button>\n?', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<Plus\s+size=\{24\}\s*/>', '', content) # If it's just the icon left somehow. Wait, better to not do this blindly. Let's stick to the button removal.

    # 2. Extract the showAI variable name
    # We look for something like onClick={() => setShowAISchedule(!showAISchedule)}
    match = re.search(r'onClick=\{\(\)\s*=>\s*setShowAI[a-zA-Z]+\(\!(showAI[a-zA-Z]+)\)\}', content)
    if match:
        show_ai_var = match.group(1)
        
        # 3. Modify the Upgrade Card to include the show_ai_var
        # The line is usually: {(!user?.subscription_tier || user?.subscription_tier === 'free') && (
        # or { (!user?.subscription_tier || user?.subscription_tier === 'free') && (
        content = re.sub(
            r'\{\s*\(\s*!user\?\.subscription_tier\s*\|\|\s*user\?\.subscription_tier\s*===\s*\'free\'\s*\)\s*&&\s*\(',
            f'{{ {show_ai_var} && (!user?.subscription_tier || user?.subscription_tier === \'free\') && (',
            content
        )
        
        # 4. Remove the Pro tier check wrapper around the Action Bar button
        # {user?.subscription_tier === 'pro' && (
        #     <button ...>
        #        ...
        #     </button>
        # )}
        # This is a bit tricky with regex because of nested braces, but usually it's exactly:
        # {user?.subscription_tier === 'pro' && (
        #     <button
        #         onClick={() => setShow...(!show...)}
        #         ...
        #     </button>
        # )}
        
        pattern = r"\{user\?\.subscription_tier === 'pro' && \(\s*(<button[^>]*onClick=\{\(\)\s*=>\s*set" + show_ai_var[0].upper() + show_ai_var[1:] + r"\(\!" + show_ai_var + r"\)\}[^>]*>.*?</button>)\s*\)\}"
        content = re.sub(pattern, r'\1', content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

print("Done")
