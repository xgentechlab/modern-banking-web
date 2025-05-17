#!/usr/bin/env python3
import asyncio
import argparse
import time
import logging
from test_query_optimization import test_query_optimization
from test_analytics_optimization import test_analytics_optimization
from test_transfer_optimization import test_transfer_optimization

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    parser = argparse.ArgumentParser(description='Run optimization tests for the banking NLP service')
    parser.add_argument(
        '--test-type', 
        choices=['query', 'analytics', 'transfer', 'all'], 
        default='all',
        help='Type of test to run: query optimization (simplified QUERY flow), analytics optimization (simplified ANALYTICS flow), transfer optimization (simplified TRANSFER flow), or all tests'
    )
    parser.add_argument(
        '--verbose', 
        action='store_true',
        help='Enable verbose output'
    )
    
    args = parser.parse_args()
    
    print("\n" + "="*70)
    print("Banking NLP Service Optimization Tests".center(70))
    print("="*70 + "\n")
    
    start_time = time.time()
    
    # Run the tests based on the selected type
    if args.test_type in ['query', 'all']:
        print("\nRunning Query Optimization Tests...")
        await test_query_optimization()
    
    if args.test_type in ['analytics', 'all']:
        print("\nRunning Analytics Optimization Tests...")
        await test_analytics_optimization()
    
    if args.test_type in ['transfer', 'all']:
        print("\nRunning Transfer Optimization Tests...")
        await test_transfer_optimization()
    
    # [Add other test types here in the future]
    
    total_time = time.time() - start_time
    
    print(f"\nTotal test execution time: {total_time:.2f} seconds")
    print("="*70)
    print("Test Run Complete".center(70))
    print("="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(main()) 