<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@techcorp.com',
                'phone' => '+1-555-0123',
                'company' => 'TechCorp Solutions',
                'address' => '123 Business Ave',
                'city' => 'San Francisco',
                'state' => 'CA',
                'country' => 'USA',
                'postal_code' => '94105',
                'status' => 'active',
                'contact_person' => 'John Smith',
                'website' => 'https://techcorp.com',
                'notes' => 'Primary contact for e-commerce platform project. Prefers email communication.'
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah@innovatetech.com',
                'phone' => '+1-555-0456',
                'company' => 'InnovateTech Inc',
                'address' => '456 Innovation Blvd',
                'city' => 'Austin',
                'state' => 'TX',
                'country' => 'USA',
                'postal_code' => '78701',
                'status' => 'active',
                'contact_person' => 'Sarah Johnson',
                'website' => 'https://innovatetech.com',
                'notes' => 'Mobile app development client. Very responsive and detail-oriented.'
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'mchen@digitalfuture.com',
                'phone' => '+1-555-0789',
                'company' => 'Digital Future LLC',
                'address' => '789 Tech Park Dr',
                'city' => 'Seattle',
                'state' => 'WA',
                'country' => 'USA',
                'postal_code' => '98101',
                'status' => 'active',
                'contact_person' => 'Michael Chen',
                'website' => 'https://digitalfuture.com',
                'notes' => 'Long-term client with multiple ongoing projects. Prefers weekly status updates.'
            ],
            [
                'name' => 'Emily Rodriguez',
                'email' => 'emily.rodriguez@brandmax.com',
                'phone' => '+1-555-0321',
                'company' => 'BrandMax Marketing',
                'address' => '321 Marketing St',
                'city' => 'New York',
                'state' => 'NY',
                'country' => 'USA',
                'postal_code' => '10001',
                'status' => 'active',
                'contact_person' => 'Emily Rodriguez',
                'website' => 'https://brandmax.com',
                'notes' => 'Digital marketing campaign client. Focuses on ROI and measurable results.'
            ],
            [
                'name' => 'David Wilson',
                'email' => 'dwilson@startupventures.com',
                'phone' => '+1-555-0654',
                'company' => 'Startup Ventures',
                'address' => '654 Venture Capital Way',
                'city' => 'Palo Alto',
                'state' => 'CA',
                'country' => 'USA',
                'postal_code' => '94301',
                'status' => 'prospect',
                'contact_person' => 'David Wilson',
                'website' => 'https://startupventures.com',
                'notes' => 'Potential client for data analytics dashboard. Currently in negotiation phase.'
            ],
            [
                'name' => 'Lisa Wang',
                'email' => 'lisa@globalenterprises.com',
                'phone' => '+1-555-0987',
                'company' => 'Global Enterprises',
                'address' => '987 Corporate Plaza',
                'city' => 'Chicago',
                'state' => 'IL',
                'country' => 'USA',
                'postal_code' => '60601',
                'status' => 'active',
                'contact_person' => 'Lisa Wang',
                'website' => 'https://globalenterprises.com',
                'notes' => 'Enterprise client with complex requirements. Requires detailed documentation.'
            ],
            [
                'name' => 'Robert Taylor',
                'email' => 'rtaylor@localbusiness.com',
                'phone' => '+1-555-0147',
                'company' => 'Local Business Solutions',
                'address' => '147 Main Street',
                'city' => 'Denver',
                'state' => 'CO',
                'country' => 'USA',
                'postal_code' => '80202',
                'status' => 'inactive',
                'contact_person' => 'Robert Taylor',
                'website' => 'https://localbusiness.com',
                'notes' => 'Previous client. Project completed successfully. May return for future work.'
            ],
            [
                'name' => 'Amanda Foster',
                'email' => 'amanda@creativestudio.com',
                'phone' => '+1-555-0258',
                'company' => 'Creative Studio Pro',
                'address' => '258 Design District',
                'city' => 'Miami',
                'state' => 'FL',
                'country' => 'USA',
                'postal_code' => '33101',
                'status' => 'active',
                'contact_person' => 'Amanda Foster',
                'website' => 'https://creativestudio.com',
                'notes' => 'Creative agency client. Values innovative design and user experience.'
            ]
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}