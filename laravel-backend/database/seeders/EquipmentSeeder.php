<?php

namespace Database\Seeders;

use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $equipment = [
            [
                'name' => 'MacBook Pro 16"',
                'code' => 'MBP-001',
                'serial_number' => 'C02XJ0AAJGH5',
                'type' => 'computer',
                'status' => 'active',
                'description' => 'Development laptop for senior developers',
                'location' => 'Office - Desk 12',
                'purchase_date' => '2023-06-15',
                'warranty_expiry' => '2026-06-15',
                'maintenance_schedule' => 'Annual',
                'specifications' => [
                    'processor' => 'Apple M2 Pro',
                    'memory' => '32GB',
                    'storage' => '1TB SSD',
                    'display' => '16-inch Liquid Retina XDR'
                ]
            ],
            [
                'name' => 'Dell OptiPlex 7090',
                'code' => 'PC-002',
                'serial_number' => 'BXBZK63',
                'type' => 'computer',
                'status' => 'active',
                'description' => 'Desktop computer for general office work',
                'location' => 'Office - Desk 5',
                'purchase_date' => '2023-03-20',
                'warranty_expiry' => '2026-03-20',
                'maintenance_schedule' => 'Bi-annual',
                'specifications' => [
                    'processor' => 'Intel Core i7-11700',
                    'memory' => '16GB DDR4',
                    'storage' => '512GB SSD',
                    'graphics' => 'Intel UHD Graphics 750'
                ]
            ],
            [
                'name' => 'Canon EOS R5',
                'code' => 'CAM-001',
                'serial_number' => '013021000001',
                'type' => 'tool',
                'status' => 'active',
                'description' => 'Professional camera for marketing content',
                'location' => 'Marketing Department',
                'purchase_date' => '2023-01-10',
                'warranty_expiry' => '2025-01-10',
                'maintenance_schedule' => 'As needed',
                'specifications' => [
                    'sensor' => '45MP Full-Frame CMOS',
                    'video' => '8K RAW, 4K 120p',
                    'iso_range' => '100-51200',
                    'mount' => 'RF Mount'
                ]
            ],
            [
                'name' => 'Herman Miller Aeron Chair',
                'code' => 'CHAIR-001',
                'serial_number' => null,
                'type' => 'furniture',
                'status' => 'active',
                'description' => 'Ergonomic office chair for executive desk',
                'location' => 'CEO Office',
                'purchase_date' => '2022-11-05',
                'warranty_expiry' => '2034-11-05',
                'maintenance_schedule' => 'Annual cleaning',
                'specifications' => [
                    'size' => 'Size B (Medium)',
                    'color' => 'Graphite',
                    'features' => 'PostureFit SL, Adjustable Arms',
                    'material' => '8Z Pellicle'
                ]
            ],
            [
                'name' => 'Toyota Prius 2023',
                'code' => 'VEH-001',
                'serial_number' => 'JTDKARFU5P3000001',
                'type' => 'vehicle',
                'status' => 'active',
                'description' => 'Company vehicle for client visits',
                'location' => 'Parking Lot A',
                'purchase_date' => '2023-08-12',
                'warranty_expiry' => '2026-08-12',
                'maintenance_schedule' => 'Every 10,000 miles',
                'specifications' => [
                    'engine' => '1.8L 4-Cylinder Hybrid',
                    'transmission' => 'CVT',
                    'fuel_economy' => '58 city / 53 highway MPG',
                    'color' => 'Midnight Black Metallic'
                ]
            ],
            [
                'name' => 'Industrial 3D Printer',
                'code' => 'PRINT-001',
                'serial_number' => 'UP300-2023-001',
                'type' => 'machinery',
                'status' => 'maintenance',
                'description' => '3D printer for prototyping department',
                'location' => 'Workshop - Bay 3',
                'purchase_date' => '2023-02-28',
                'warranty_expiry' => '2025-02-28',
                'maintenance_schedule' => 'Monthly calibration',
                'specifications' => [
                    'build_volume' => '300 x 300 x 300mm',
                    'layer_resolution' => '0.05-0.3mm',
                    'materials' => 'PLA, ABS, PETG, TPU',
                    'connectivity' => 'WiFi, USB, Ethernet'
                ]
            ]
        ];

        foreach ($equipment as $item) {
            Equipment::create($item);
        }
    }
}