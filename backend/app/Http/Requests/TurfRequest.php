<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TurfRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'turf_name' => 'required|string|max:255',
            'location' => 'required|string|max:500',
            'capacity' => 'required|integer|min:1|max:100',
            'sport_type' => 'required|string|max:100',
            'facilities' => 'nullable|string|max:1000',
            'description' => 'nullable|string|max:2000',
            'pricing_structure' => 'required|array',
            'pricing_structure.weekday' => 'required|array',
            'pricing_structure.weekend' => 'required|array',
            'pricing_structure.weekday.morning' => 'required|numeric|min:0',
            'pricing_structure.weekday.afternoon' => 'required|numeric|min:0',
            'pricing_structure.weekday.evening' => 'required|numeric|min:0',
            'pricing_structure.weekday.night' => 'required|numeric|min:0',
            'pricing_structure.weekend.morning' => 'required|numeric|min:0',
            'pricing_structure.weekend.afternoon' => 'required|numeric|min:0',
            'pricing_structure.weekend.evening' => 'required|numeric|min:0',
            'pricing_structure.weekend.night' => 'required|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'turf_name.required' => 'Turf name is required',
            'location.required' => 'Location is required',
            'capacity.required' => 'Capacity is required',
            'capacity.min' => 'Capacity must be at least 1',
            'pricing_structure.required' => 'Pricing structure is required',
            'pricing_structure.*.*.required' => 'All pricing fields are required',
            'pricing_structure.*.*.numeric' => 'Price must be a valid number',
            'pricing_structure.*.*.min' => 'Price cannot be negative',
        ];
    }
}