#
# Sphinx configuration file sample
#
# WARNING! While this sample file mentions all available options,
# it contains (very) short helper descriptions only. Please refer to
# doc/sphinx.html for details.
#

#############################################################################
## data source definition
#############################################################################

source t_user_temp
{
	# data source type. mandatory, no default value
	# known types are mysql, pgsql, mssql, xmlpipe, xmlpipe2, odbc
	type					= mysql

	#####################################################################
	## SQL settings (for 'mysql' and 'pgsql' types)
	#####################################################################

	# some straightforward parameters for SQL source types
	sql_host				= localhost
	sql_user				= socialcrm
	sql_pass				= socialcrm
	sql_db					= socialcrm
	sql_port				= 3306	# optional, default is 3306
	sql_query_pre		= SET CHARSET utf8
	sql_query_pre		= SET SESSION query_cache_type=OFF
	sql_query_pre		= REPLACE INTO sph_counter SELECT 't_user_temp_old',MAX(id) FROM t_user_temp
	sql_query_pre		= REPLACE INTO sph_counter SELECT 't_user_temp_new',MAX(id) FROM t_user_temp
	 sql_sock				= /home/mysql/mysql.sock


	sql_query =  SELECT id, puid,uid, UNIX_TIMESTAMP(created_at) AS date_added, screen_name ,location ,user_type,rel_count,count_from,count_to \
	,province,city,profile_image_url,gender,followers_count,friends_count,statuses_count,favourites_count,verified_type,follow_time,\
	verified_reason,verified,tags,social_tags ,rel_kol,rel_custom ,description\
        FROM t_user_temp where id<= (SELECT data FROM sph_counter WHERE id = 't_user_temp_old')
	
	sql_attr_uint = puid
	sql_attr_uint = uid
	 sql_attr_uint = province
	 sql_attr_uint =city
	 sql_attr_uint = followers_count
	 sql_attr_uint = statuses_count
	 sql_attr_uint = friends_count
	 sql_attr_uint = favourites_count
	 sql_attr_uint = user_type
	 sql_attr_uint = gender
	 sql_attr_uint = count_to
	 sql_attr_uint = count_from
	 sql_attr_uint = rel_count
	 sql_attr_uint = rel_kol
 	 sql_attr_uint = rel_custom
	 sql_attr_uint =follow_time
	 sql_attr_bigint = verified_type
	sql_attr_timestamp		= date_added
	sql_field_string = location
	sql_field_string = screen_name
	sql_field_string =profile_image_url
	sql_field_string = verified
	sql_field_string = verified_reason
	sql_field_string = tags
	sql_field_string = social_tags
	sql_field_string = description
	sql_ranged_throttle	= 0
	sql_query_info		= SELECT * FROM t_user_temp WHERE id=$id
}


# all the parameters are copied from the parent source,
# and may then be overridden in this source definition
source t_user_temp_inc : t_user_temp
{
	 sql_query_pre           = SET CHARSET utf8
        sql_query_pre           = SET SESSION query_cache_type=OFF
        sql_query_pre           = REPLACE INTO sph_counter SELECT 't_user_temp_old',data FROM sph_counter WHERE  id = 'account_sina_new'
        sql_query_pre           = REPLACE INTO sph_counter SELECT 't_user_temp_new',MAX(id) FROM t_user_temp

        sql_query =  SELECT id, puid,uid, UNIX_TIMESTAMP(created_at) AS date_added, screen_name ,location,user_type,rel_count,count_from,count_to \
        ,province,city,profile_image_url,gender,followers_count,friends_count,statuses_count,favourites_count,verified_type,\
        verified_reason,verified,tags,follow_time ,rel_kol,rel_custom \
        FROM t_user_temp where id> and wom_account_sina.id <= (SELECT data FROM sphinx_flag WHERE id = 'account_sina_new') and id<=(SELECT data FROM sph_counter\
	 WHERE id = 't_user_temp_old')

	sql_ranged_throttle			= 100
}

#############################################################################
## index definition
#############################################################################
index t_user_temp
{
	# document source(s) to index
	# multi-value, mandatory
	# document IDs must be globally unique across all sources
	source			= t_user_temp

	# index files path and file name, without extension
	# mandatory, path must be writable, extensions will be auto-appended
	path			= /usr/local/sphinx/var/data/t_user_temp

	# document attribute values (docinfo) storage mode
	# optional, default is 'extern'
	# known values are 'none', 'extern' and 'inline'
	docinfo			= extern

	# memory locking for cached data (.spa and .spi), to prevent swapping
	# optional, default is 0 (do not mlock)
	# requires searchd to be run from root
	mlock			= 0

	# a list of morphology preprocessors to apply
	# optional, default is empty
	#
	# builtin preprocessors are 'none', 'stem_en', 'stem_ru', 'stem_enru',
	# 'soundex', and 'metaphone'; additional preprocessors available from
	# libstemmer are 'libstemmer_XXX', where XXX is algorithm code
	# (see libstemmer_c/libstemmer/modules.txt)
	#
	# morphology 	= stem_en, stem_ru, soundex
	# morphology	= libstemmer_german
	# morphology	= libstemmer_sv
	morphology		= none

	# minimum word length at which to enable stemming
	# optional, default is 1 (stem everything)
	#


	# minimum indexed word length
	# default is 1 (index everything)
	min_word_len		= 1

	# charset encoding type
	# optional, default is 'sbcs'
	# known types are 'sbcs' (Single Byte CharSet) and 'utf-8'
	charset_type		= utf-8

	# charset definition and case folding rules "table"
	# known values are 0 (do not strip) and 1 (do strip)
	# optional, default is 0
	html_strip				= 0

	# what HTML attributes to index if stripping HTML
	#
	# overshort_step			= 1
charset_table	= U+FF10..U+FF19->0..9, 0..9, U+FF41..U+FF5A->a..z, U+FF21..U+FF3A->a..z,\
	A..Z->a..z, a..z, U+0149, U+017F, U+0138, U+00DF, U+00FF, U+00C0..U+00D6->U+00E0..U+00F6,\
	U+00E0..U+00F6, U+00D8..U+00DE->U+00F8..U+00FE, U+00F8..U+00FE, U+0100->U+0101, U+0101,\
	U+0102->U+0103, U+0103, U+0104->U+0105, U+0105, U+0106->U+0107, U+0107, U+0108->U+0109,\
	U+0109, U+010A->U+010B, U+010B, U+010C->U+010D, U+010D, U+010E->U+010F, U+010F,\
	U+0110->U+0111, U+0111, U+0112->U+0113, U+0113, U+0114->U+0115, U+0115, \
	U+0116->U+0117,U+0117, U+0118->U+0119, U+0119, U+011A->U+011B, U+011B, U+011C->U+011D,\
	 U+011D,U+011E->U+011F, U+011F, U+0130->U+0131, U+0131, U+0132->U+0133, U+0133, \
	U+0134->U+0135,U+0135, U+0136->U+0137, U+0137, U+0139->U+013A, U+013A, U+013B->U+013C, \
	U+013C,U+013D->U+013E, U+013E, U+013F->U+0140, U+0140, U+0141->U+0142, U+0142, \
	U+0143->U+0144,U+0144, U+0145->U+0146, U+0146, U+0147->U+0148, U+0148, U+014A->U+014B, \
	U+014B,U+014C->U+014D, U+014D, U+014E->U+014F, U+014F, U+0150->U+0151, U+0151, \
	U+0152->U+0153,U+0153, U+0154->U+0155, U+0155, U+0156->U+0157, U+0157, U+0158->U+0159,\
	 U+0159,U+015A->U+015B, U+015B, U+015C->U+015D, U+015D, U+015E->U+015F, U+015F, \
	U+0160->U+0161,U+0161, U+0162->U+0163, U+0163, U+0164->U+0165, U+0165, U+0166->U+0167, \
	U+0167,U+0168->U+0169, U+0169, U+016A->U+016B, U+016B, U+016C->U+016D, U+016D, \
	U+016E->U+016F,U+016F, U+0170->U+0171, U+0171, U+0172->U+0173, U+0173, U+0174->U+0175,\
	 U+0175,U+0176->U+0177, U+0177, U+0178->U+00FF, U+00FF, U+0179->U+017A, U+017A, \
	U+017B->U+017C,U+017C, U+017D->U+017E, U+017E, U+0410..U+042F->U+0430..U+044F, \
	U+0430..U+044F,U+05D0..U+05EA, U+0531..U+0556->U+0561..U+0586, U+0561..U+0587, \
	U+0621..U+063A, U+01B9,U+01BF, U+0640..U+064A, U+0660..U+0669, U+066E, U+066F, \
	U+0671..U+06D3, U+06F0..U+06FF,U+0904..U+0939, U+0958..U+095F, U+0960..U+0963, \
	U+0966..U+096F, U+097B..U+097F,U+0985..U+09B9, U+09CE, U+09DC..U+09E3, U+09E6..U+09EF, \
	U+0A05..U+0A39, U+0A59..U+0A5E,U+0A66..U+0A6F, U+0A85..U+0AB9, U+0AE0..U+0AE3, \
	U+0AE6..U+0AEF, U+0B05..U+0B39,U+0B5C..U+0B61, U+0B66..U+0B6F, U+0B71, U+0B85..U+0BB9, \
	U+0BE6..U+0BF2, U+0C05..U+0C39,U+0C66..U+0C6F, U+0C85..U+0CB9, U+0CDE..U+0CE3, \
	U+0CE6..U+0CEF, U+0D05..U+0D39, U+0D60,U+0D61, U+0D66..U+0D6F, U+0D85..U+0DC6, \
	U+1900..U+1938, U+1946..U+194F, U+A800..U+A805,U+A807..U+A822, U+0386->U+03B1, \
	U+03AC->U+03B1, U+0388->U+03B5, U+03AD->U+03B5,U+0389->U+03B7, U+03AE->U+03B7, \
	U+038A->U+03B9, U+0390->U+03B9, U+03AA->U+03B9,U+03AF->U+03B9, U+03CA->U+03B9, \
	U+038C->U+03BF, U+03CC->U+03BF, U+038E->U+03C5,U+03AB->U+03C5, U+03B0->U+03C5, \
	U+03CB->U+03C5, U+03CD->U+03C5, U+038F->U+03C9,U+03CE->U+03C9, U+03C2->U+03C3, \
	U+0391..U+03A1->U+03B1..U+03C1,U+03A3..U+03A9->U+03C3..U+03C9, U+03B1..U+03C1, \
	U+03C3..U+03C9, U+0E01..U+0E2E,U+0E30..U+0E3A, U+0E40..U+0E45, U+0E47, U+0E50..U+0E59, \
	U+A000..U+A48F, U+4E00..U+9FBF,U+3400..U+4DBF, U+20000..U+2A6DF, U+F900..U+FAFF, \
	U+2F800..U+2FA1F, U+2E80..U+2EFF,U+2F00..U+2FDF, U+3100..U+312F, U+31A0..U+31BF, \
	U+3040..U+309F, U+30A0..U+30FF,U+31F0..U+31FF, U+AC00..U+D7AF, U+1100..U+11FF, \
	U+3130..U+318F, U+A000..U+A48F,U+A490..U+A4CF 
		ngram_len = 1 # 对于非字母型数据的长度切割
		ngram_chars = U+4E00..U+9FBF, U+3400..U+4DBF, U+20000..U+2A6DF, U+F900..U+FAFF,\
	U+2F800..U+2FA1F, U+2E80..U+2EFF, U+2F00..U+2FDF, U+3100..U+312F, U+31A0..U+31BF,\
	U+3040..U+309F, U+30A0..U+30FF, U+31F0..U+31FF, U+AC00..U+D7AF, U+1100..U+11FF,\
	U+3130..U+318F, U+A000..U+A48F, U+A490..U+A4CF

	# position increment on stopword
	# optional, allowed values are 0 and 1, default is 1
	#
	# stopword_step			= 1
}


# inherited index example
#
# all the parameters are copied from the parent index,
# and may then be overridden in this index definition
index t_user_temp_inc : t_user_temp
{
	path			= /usr/local/sphinx/var/data/t_user_temp_inc
	morphology		= stem_en
}


# distributed index example
#
# this is a virtual index which can NOT be directly indexed,
# and only contains references to other local and/or remote indexes
index dist1
{
	# 'distributed' index type MUST be specified
	type				= distributed

	# local index to be searched
	# there can be many local indexes configured
	local				= t_user_temp
	local				= t_user_temp_inc

	# remote agent
	# multiple remote agents may be specified
	# syntax for TCP connections is 'hostname:port:index1,[index2[,...]]'
	# syntax for local UNIX connections is '/path/to/socket:index1,[index2[,...]]'
	agent				= localhost:9313:remote1
	agent				= localhost:9314:remote2,remote3
	# agent				= /var/run/searchd.sock:remote4

	# blackhole remote agent, for debugging/testing
	# network errors and search results will be ignored
	#
	# agent_blackhole		= testbox:9312:testindex1,testindex2


	# remote agent connection timeout, milliseconds
	# optional, default is 1000 ms, ie. 1 sec
	agent_connect_timeout	= 1000

	# remote agent query timeout, milliseconds
	# optional, default is 3000 ms, ie. 3 sec
	agent_query_timeout		= 3000
}

#############################################################################
## indexer settings
#############################################################################

indexer
{
	# memory limit, in bytes, kiloytes (16384K) or megabytes (256M)
	# optional, default is 32M, max is 2047M, recommended is 256M to 1024M
	mem_limit			= 32M

	# maximum IO calls per second (for I/O throttling)
	# optional, default is 0 (unlimited)
	#
	# max_iops			= 40


	# maximum IO call size, bytes (for I/O throttling)
	# optional, default is 0 (unlimited)
	#
	# max_iosize		= 1048576


	# maximum xmlpipe2 field length, bytes
	# optional, default is 2M
	#
	# max_xmlpipe2_field	= 4M


	# write buffer size, bytes
	# several (currently up to 4) buffers will be allocated
	# write buffers are allocated in addition to mem_limit
	# optional, default is 1M
	#
	# write_buffer		= 1M
}

#############################################################################
## searchd settings
#############################################################################

searchd
{
	# hostname, port, or hostname:port, or /unix/socket/path to listen on
	# multi-value, multiple listen points are allowed
	# optional, default is 0.0.0.0:9312 (listen on all interfaces, port 9312)
	#
	# listen				= 127.0.0.1
	# listen				= 192.168.0.1:9312
	# listen				= 9312
	# listen				= /var/run/searchd.sock


	# log file, searchd run info is logged here
	# optional, default is 'searchd.log'
	log					= /usr/local/sphinx/var/log/searchd.log

	# query log file, all search queries are logged here
	# optional, default is empty (do not log queries)
	query_log			= /usr/local/sphinx/var/log/query.log

	# client read timeout, seconds
	# optional, default is 5
	read_timeout		= 5

	# request timeout, seconds
	# optional, default is 5 minutes
	client_timeout		= 300

	# maximum amount of children to fork (concurrent searches to run)
	# optional, default is 0 (unlimited)
	max_children		= 30

	# PID file, searchd process ID file name
	# mandatory
	pid_file			= /usr/local/sphinx/var/log/searchd.pid

	# max amount of matches the daemon ever keeps in RAM, per-index
	# WARNING, THERE'S ALSO PER-QUERY LIMIT, SEE SetLimits() API CALL
	# default is 1000 (just like Google)
	max_matches			= 1000

	# seamless rotate, prevents rotate stalls if precaching huge datasets
	# optional, default is 1
	seamless_rotate		= 1

	# whether to forcibly preopen all indexes on startup
	# optional, default is 0 (do not preopen)
	preopen_indexes		= 0

	# whether to unlink .old index copies on succesful rotation.
	# optional, default is 1 (do unlink)
	unlink_old			= 1

	# attribute updates periodic flush timeout, seconds
	# updates will be automatically dumped to disk this frequently
	# optional, default is 0 (disable periodic flush)
	#
	# attr_flush_period	= 900


	# instance-wide ondisk_dict defaults (per-index value take precedence)
	# optional, default is 0 (precache all dictionaries in RAM)
	#
	# ondisk_dict_default	= 1


	# MVA updates pool size
	# shared between all instances of searchd, disables attr flushes!
	# optional, default size is 1M
	mva_updates_pool	= 1M

	# max allowed network packet size
	# limits both query packets from clients, and responses from agents
	# optional, default size is 8M
	max_packet_size		= 8M

	# crash log path
	# searchd will (try to) log crashed query to 'crash_log_path.PID' file
	# optional, default is empty (do not create crash logs)
	#
	# crash_log_path		= /usr/local/sphinx/var/log/crash


	# max allowed per-query filter count
	# optional, default is 256
	max_filters			= 256

	# max allowed per-filter values count
	# optional, default is 4096
	max_filter_values	= 4096


	# socket listen queue length
	# optional, default is 5
	#
	# listen_backlog		= 5


	# per-keyword read buffer size
	# optional, default is 256K
	#
	# read_buffer			= 256K


	# unhinted read size (currently used when reading hits)
	# optional, default is 32K
	#
	# read_unhinted		= 32K
}

# --eof--