<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->string('tax_status', 20)->default('taxable')->after('discount_price')->index();
            $table->string('tax_class', 20)->default('standard')->after('tax_status')->index();
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->decimal('regular_subtotal', 12, 2)->default(0)->after('subtotal');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('regular_subtotal');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('discount_amount');
            $table->decimal('tax_added_amount', 12, 2)->default(0)->after('tax_amount');
            $table->decimal('tax_included_amount', 12, 2)->default(0)->after('tax_added_amount');
        });

        Schema::table('order_items', function (Blueprint $table): void {
            $table->decimal('regular_unit_price', 12, 2)->default(0)->after('unit_price');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('quantity');
            $table->string('tax_status', 20)->default('taxable')->after('discount_amount');
            $table->string('tax_class', 20)->default('standard')->after('tax_status');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('tax_class');
            $table->boolean('tax_is_included')->default(false)->after('tax_amount');
        });

        $zeroRateWordPressIds = [
            7989,8011,8019,8537,8546,8570,8578,8586,8594,8612,8628,8638,8651,8707,8718,8744,8762,8788,8803,8813,8817,8832,8846,8857,8871,8885,8896,8908,8932,8943,8953,8965,8977,8989,8998,9005,9011,9016,9022,9034,9058,9061,9069,9104,9119,9124,9130,9146,9154,9170,9181,9189,9198,9209,9225,9253,9450,9605,9623,9624,9697,9713,9751,10130,10180,10232,10455,10492,10494,10504,10505,10506,10507,10508,10509,10510,10524,10533,10548,10559,10569,10574,10694,10702,10712,10736,10746,10758,10770,10870,10871,11058,11062,11080,11099,11113,11345,11758,11762,11767,11772,11776,11819,11832,11848,11873,11885,11890,11917,11925,11953,12031,12043,12048,12052,12070,12084,12091,12202,12239,12393,12419,12432,12487,12518,12573,12646,12673,12721,12778,12812,12841,12998,13064,13085,13110,13140,13160,13312,13335,13356,13371,13382,13443,13446,13581,13595,13599,13611,13634,13643,13654,13665,13693,13715,13726,13743,13757,13774,13784,13794,13806,13813,14001,14044,14070,14088,14105,14163,14179,14196,15070,15080,15212,15214,15216,15240,15429,15434,15630,16940,17018,17207,17280,17281,17308,17547,17557,17575,17627,17680,17706,17728,17739,17755,17894,17911,17995,18015,18036,18108,18161,18173,18305,18311,18334,18340,18380,18456,18461,18765,18798,18807,18821,18986,19217,19233,19255,19274,19295,19330,19356,19401,19425,19449,19702,19719,19747,19858,19865,19932,20114,20130,20137,20271,20279,20292,20301,20303,20315,20322,20325,20328,20331,20334,20385,20415,20443,20815,20881,20894,20909,20915,20922,20929,20937,20939,20959,20973,20995,21003,21030,21037,21065,21072,21079,21087,21180,21357,21449,21464,21467,21570,21613,21632,21688,21719,21833,21843,21887,21920,21923,21928,21932,22425,22952,22962,22979,22993,23105,23451,23461,23514,23708,23789,23799,23809,23855,23862,23869,23906,23922,23935,23941,23946,23960,23966,23977,23998,24002,24017,24025,24041,24051,24056,24068,24104,24347,24359,24436,24438,24459,24514,24531,24532,
        ];

        DB::table('products')
            ->whereIn('wordpress_id', $zeroRateWordPressIds)
            ->update(['tax_status' => 'taxable', 'tax_class' => 'zero_rate']);

        DB::table('products')
            ->whereIn('wordpress_id', [11969, 18770, 19793, 24270, 24275])
            ->update(['tax_status' => 'none', 'tax_class' => 'standard']);
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table): void {
            $table->dropColumn([
                'regular_unit_price', 'discount_amount', 'tax_status', 'tax_class',
                'tax_amount', 'tax_is_included',
            ]);
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn([
                'regular_subtotal', 'discount_amount', 'tax_amount',
                'tax_added_amount', 'tax_included_amount',
            ]);
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex(['tax_status']);
            $table->dropIndex(['tax_class']);
            $table->dropColumn(['tax_status', 'tax_class']);
        });
    }
};
