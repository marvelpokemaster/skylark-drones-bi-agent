import re

with open("src/app/page.tsx", "r") as f:
    page_content = f.read()

# Scale header in page.tsx
page_content = page_content.replace(
    'className="text-xl md:text-2xl font-space',
    'className="text-xl md:text-2xl 2xl:text-4xl font-space'
)
page_content = page_content.replace(
    'className="text-[10px] md:text-xs font-mono',
    'className="text-[10px] md:text-xs 2xl:text-sm font-mono'
)
# Scale main container padding/gap
page_content = page_content.replace(
    'className="flex-1 w-full px-4 md:px-8 py-6 flex flex-col gap-6"',
    'className="flex-1 w-full px-4 md:px-8 2xl:px-16 py-6 2xl:py-8 flex flex-col gap-6 2xl:gap-8"'
)

with open("src/app/page.tsx", "w") as f:
    f.write(page_content)


with open("src/components/Dashboard.tsx", "r") as f:
    dash_content = f.read()

# Controls Bar scaling
dash_content = dash_content.replace('text-xs font-mono', 'text-xs 2xl:text-sm font-mono')
dash_content = dash_content.replace('w-3.5 h-3.5', 'w-3.5 h-3.5 2xl:w-4 2xl:h-4')

# KPI Grid Gap
dash_content = dash_content.replace(
    'className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4"',
    'className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 2xl:gap-6"'
)

# KPI Card Padding/Gap/Text
dash_content = dash_content.replace(
    '"glass-panel p-4 lg:p-5 flex flex-col gap-3 relative',
    '"glass-panel p-4 lg:p-5 2xl:p-6 flex flex-col gap-3 2xl:gap-4 relative'
)
dash_content = dash_content.replace(
    'text-[10px] md:text-xs font-mono',
    'text-[10px] md:text-xs 2xl:text-sm font-mono'
)
dash_content = dash_content.replace(
    'text-xl md:text-2xl font-space',
    'text-xl md:text-2xl 2xl:text-4xl font-space'
)

# Section Titles
dash_content = dash_content.replace(
    'text-xs uppercase tracking-widest',
    'text-xs 2xl:text-sm uppercase tracking-widest'
)

# Matrix Table
dash_content = dash_content.replace(
    'text-xs font-mono text-zinc-500',
    'text-xs 2xl:text-sm font-mono text-zinc-500'
)
dash_content = dash_content.replace(
    'text-sm text-zinc-300 font-medium',
    'text-sm 2xl:text-base text-zinc-300 font-medium'
)
dash_content = dash_content.replace(
    'text-sm text-right font-mono',
    'text-sm 2xl:text-base text-right font-mono'
)

# Assistant Panel
dash_content = dash_content.replace(
    'text-lg font-space font-medium',
    'text-lg 2xl:text-xl font-space font-medium'
)
dash_content = dash_content.replace(
    'text-[10px] text-zinc-500',
    'text-[10px] 2xl:text-xs text-zinc-500'
)
# We only want to touch the user/assistant chat text (which is text-sm usually)
dash_content = dash_content.replace(
    'text-sm text-zinc-300',
    'text-sm 2xl:text-base text-zinc-300'
)
dash_content = dash_content.replace(
    'text-sm text-zinc-100',
    'text-sm 2xl:text-base text-zinc-100'
)

# Input Box
dash_content = dash_content.replace(
    'text-sm placeholder:text-zinc-500',
    'text-sm 2xl:text-base placeholder:text-zinc-500'
)

with open("src/components/Dashboard.tsx", "w") as f:
    f.write(dash_content)
