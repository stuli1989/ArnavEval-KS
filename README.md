# Personal Financial Tracker

A comprehensive web application for planning your financial future and tracking long-term financial goals.

## Features

- **Basic Information**: Set your age and projection time range
- **Income Streams**: Add multiple income sources with growth projections
- **Expense Streams**: Track ongoing expenses with inflation adjustments
- **Assets**: Manage different types of assets with growth rates
- **Major Expenses**: Plan for large one-time expenses or loans
- **Savings Distribution**: Allocate savings across different assets
- **Financial Projection**: Visualize your financial future with interactive charts
- **Export Data**: Download your financial projections as CSV

## Technology Stack

- **Framework**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide
- **Charting**: Recharts

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How It Works

The application allows you to input various aspects of your financial life:

1. **Basic Information**: Your age and the time range for projections
2. **Income Streams**: Different sources of income (salary, business, etc.)
3. **Expense Streams**: Regular expenses (living costs, subscriptions, etc.)
4. **Assets**: Your current assets and their expected growth rates
5. **Major Expenses**: Large one-time expenses or loans (house, car, etc.)
6. **Savings Distribution**: How you allocate your savings across different assets

Based on this information, the application calculates and visualizes your financial projection, showing:

- Income and expenses as stacked bars
- Asset growth as stacked areas
- Major one-time expenses as scatter points
- Net worth and savings trends

## License

MIT
