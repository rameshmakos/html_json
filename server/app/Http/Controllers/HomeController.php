<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
Use public_path;
Use DB;

class HomeController extends Controller
{

    public function index()
    {
        $html='';
        $th='<tr>';
        $td_column =array();
        $pages= public_path('/pages/MediumTermInvestment.json');
        $data= public_path('/pages/MediumTermData.json');
        $pages_array = json_decode(file_get_contents($pages), true);
        $data_array = json_decode(file_get_contents($data), true);
        if(!empty($pages_array['children']))
        {
            foreach ($pages_array['children'] as $key => $value) {
                if($value['visibility']==true)
                {
                    array_push($td_column,$value['index']);
                    $style=$this->arrange_style($value['style']);
                    $th.="<th style='".$style."'>".$value['name'].'</th>';
                    
                }
            }        
        }
        $th.='</tr>';
        $td='';
        if(!empty($data_array['data']))
        {
            foreach ($data_array['data'] as $key => $value) {
                $td.="<tr>";
                if(!empty($td_column))
                {
                    foreach ($td_column as $key1 => $value1) {
                       $td.="<td>".$value[$value1]."</td>"; 
                    }
                }
                $td.="</tr>";
                
            }            
        }
        $html = "<table>".$th.$td."</table>";
        return json_encode(['status'=>true,"data"=>$html]);
        
    }

    function arrange_style($style)
    {
        $html_style='';
        if(0<count($style))
        {
            foreach ($style as $key => $value) {                
                $html_style.=$key.":".$value.";";
            }
        }
        return $html_style;
    }


    public function show()
    {
        $html='';
        $th='<tr>';
        $td_column =array();
        $pages= public_path('/pages/ShortTermInvestment.json');
        $data= public_path('/pages/ShortTermData.json');
        $pages_array = json_decode(file_get_contents($pages), true);
        $data_array = json_decode(file_get_contents($data), true);
        if(!empty($pages_array['children']))
        {
            foreach ($pages_array['children'] as $key => $value) {
                if($value['visibility']==true)
                {
                    array_push($td_column,$value['index']);
                    $style=$this->arrange_style($value['style']);
                    $th.="<th style='".$style."'>".$value['name'].'</th>';
                    
                }
            }        
        }
        $th.='</tr>';
        $td='';
        if(!empty($data_array['data']))
        {
            foreach ($data_array['data'] as $key => $value) {
                $td.="<tr>";
                if(!empty($td_column))
                {
                    foreach ($td_column as $key1 => $value1) {
                       $td.="<td>".$value[$value1]."</td>"; 
                    }
                }
                $td.="</tr>";
                
            }            
        }
        $html = "<table>".$th.$td."</table>";
        return json_encode(['status'=>true,"data"=>$html]);
        
    }
    public function insert()
    {
        $data= public_path('/pages/ShortTermData.json');
        $data_array = json_decode(file_get_contents($data), true);
        foreach ($data_array as $key => $value) {
            DB::table('stock_short_details')->insert($value);
        }
    }
    public function MediumTerm_data()
    {
        $data= public_path('/pages/MediumTermInvestment.json');
        $data_array = json_decode(file_get_contents($data), true);
        $column='';
        $table='';
        if(!empty($data_array))
        {
            foreach ($data_array['children'] as $key => $value) {
                $table = strtok($value['data_source'], '.');
                $column.=" ".$value['data_source'].",";
            }
        }
        $column=rtrim($column,',');
        $sql="SELECT $column FROM $table WHERE 1";
        $results = DB::select( DB::raw($sql) );
        $data_array['data']=$results;
        return json_encode($data_array);
    }
    public function ShortTerm_data()
    {
        $data= public_path('/pages/ShortTermInvestment.json');
        $data_array = json_decode(file_get_contents($data), true);
        $column='';
        $table='';
        if(!empty($data_array))
        {
            foreach ($data_array['children'] as $key => $value) {
                $table = strtok($value['data_source'], '.');
                $column.=" ".$value['data_source'].",";
            }
        }
        $column=rtrim($column,',');
        $sql="SELECT $column FROM $table WHERE 1";
        $results = DB::select(DB::raw($sql));  
        $data_array['data']=$results;
        return json_encode($data_array);
    }
}
